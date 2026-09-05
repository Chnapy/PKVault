using System.Diagnostics;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Text.Encodings.Web;
using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.DependencyInjection;
using Photino.NET;
using Photino.NET.Server;
using PKVault.Core;
using Serilog;

namespace PKVault.Desktop;

class Program
{
    private static readonly bool WindowsOS = RuntimeInformation.IsOSPlatform(OSPlatform.Windows);
    private static readonly bool LinuxOS = RuntimeInformation.IsOSPlatform(OSPlatform.Linux);
    private static readonly bool MacOS = RuntimeInformation.IsOSPlatform(OSPlatform.OSX);

    private static readonly Assembly Assembly = Assembly.GetExecutingAssembly();
    private static readonly string AssemblyStaticPrefix = "PKVault.Desktop.Resources.wwwroot.";

    private static readonly DesktopMessageJsonContext messageJsonContext = new(new()
    {
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
    });

    private static IFileChooser fileChooser = new DefaultFileChooser();

    private static Task<IServiceProvider>? SetupTask = null;

    [DllImport("kernel32.dll")]
    static extern bool AttachConsole(uint dwProcessId);

    const uint ATTACH_PARENT_PROCESS = 0x0ffffffff;

    [STAThread]
    static void Main(string[] args)
    {
        AttachConsole(ATTACH_PARENT_PROCESS);
        Core.Program.Initialize();

        if (LinuxOS)
        {
            fileChooser = new LinuxFileChooser();

            // Fix https://github.com/Chnapy/PKVault/issues/190
            // This variable affects only nvidia-based systems, with small perf impact
            Environment.SetEnvironmentVariable("__NV_DISABLE_EXPLICIT_SYNC", "1");
        }

        try
        {
            SettingsService.FlatpakMigrateIfAny();

            var window = new PhotinoWindow();

            var staticServerRun = SetupServer(out var baseUrl);
            _ = staticServerRun();

            window.RegisterWindowCreatedHandler(async (sender, e) =>
            {
                Log.Logger.Debug("CREATED");
            });
            window.RegisterWindowClosingHandler((sender, e) =>
            {
                if (SetupTask == null || !SetupTask.IsCompletedSuccessfully)
                    return false;

                var emptyActionList = Core.Program.HasEmptyActionList(SetupTask.Result);

                if (!emptyActionList)
                {
                    var result = window.ShowMessage("PKVault", "You have unsaved changes. Are you sure ?", PhotinoDialogButtons.OkCancel);
                    if (result == PhotinoDialogResult.Cancel)
                    {
                        return true;
                    }
                }

                return false;
            });
            // window.RegisterWindowCreatingHandler((sender, e) =>
            // {
            //     log.LogInformation("CREATING");

            // });

            SetupWindow(window, baseUrl);

            SetupTask = SetupCore();

            InjectIntoFrontend(window);

            window.WaitForClose();
        }
        catch (Exception ex)
        {
            Log.Fatal(ex, "An unhandled exception occurred during startup");
        }
        finally
        {
            LogUtil.Dispose();
        }
    }

    private static async Task<IServiceProvider> SetupCore()
    {
        var services = new ServiceCollection();
        Core.Program.ConfigureServices(services);
        var sp = services.BuildServiceProvider();

        await Core.Program.SetupData(sp);

        return sp;
    }

    private static Func<Task> SetupServer(out string baseUrl)
    {
        // IANA (RFC 6335) less-used ports
        var server = PhotinoServer.CreateStaticFileServer([], 49152, 16000, "wwwroot", out baseUrl);

        var contentTypeProvider = new FileExtensionContentTypeProvider();

        server.Map("{**catchAll}", async context =>
        {
            var path = context.Request.Path.Value ?? "";
            // Log.Debug($"PATH {path}");

            try
            {
                if (path.StartsWith("/api/"))
                {
                    var sp = await SetupTask!;
                    using var scope = sp.CreateScope();
                    var coreRouter = scope.ServiceProvider.GetRequiredService<CoreRouter>();

                    var req = context.Request;
                    var res = context.Response;

                    string queryString = context.Request.QueryString.HasValue
                        ? context.Request.QueryString.Value
                        : "";

                    var result = await coreRouter.Dispatch(scope.ServiceProvider, req.Method, req.Path, queryString, req.Body);

                    res.StatusCode = result.StatusCode ?? 200;

                    if (result.Header is not null)
                        foreach (var (key, values) in result.Header)
                            res.Headers[key] = values;

                    if (result is CoreFileResponse fileResponse)
                    {
                        res.ContentType = fileResponse.ContentType ?? "application/octet-stream";

                        var contentDispositionHeader = new System.Net.Mime.ContentDisposition()
                        {
                            FileName = fileResponse.File.FileName,
                            DispositionType = "attachment"
                        };
                        res.Headers.Append("Content-Disposition", contentDispositionHeader.ToString());

                        if (fileResponse.LastModified is not null)
                            res.GetTypedHeaders().LastModified = fileResponse.LastModified;

                        await using var stream = fileResponse.File.Stream;
                        await stream.CopyToAsync(res.Body);
                    }

                    else if (result is CoreJSONResponse jsonResponse)
                    {
                        res.ContentType = jsonResponse.ContentType ?? "application/json";
                        if (jsonResponse.Data is not null)
                        {
                            var typeInfo = RouteJsonContext.DefaultWithOptions.GetTypeInfo(jsonResponse.Data.GetType())
                                ?? throw new InvalidOperationException($"Missing TypeInfo for type {jsonResponse.Data.GetType()}");

                            await JsonSerializer.SerializeAsync(
                                res.Body,
                                jsonResponse.Data,
                                typeInfo
                            );
                        }
                    }
                }
                else
                {
                    // http://localhost:8000/api/storage/main/pkm-version
                    // http://localhost:8000/index.html?server=http://localhost:57471
                    var uri = context.Request.GetDisplayUrl();
                    // log.LogInformation($"DEBUG {uri}");

                    if (uri.EndsWith("/.well-known/appspecific/com.chrome.devtools.json"))
                    {
                        context.Response.StatusCode = StatusCodes.Status404NotFound;
                        return;
                    }

                    var uriParts = uri.Split('?')[0].Split('/');

                    var uriActionAndRest = uriParts.Skip(3);
                    var uriAction = uriActionAndRest.First();
                    var uriDirectories = uriActionAndRest.SkipLast(1);
                    var uriFilename = uriActionAndRest.Last();
                    var uriFilenameExt = Path.GetExtension(uriFilename);
                    var assemblyActionAndRest = string.Join('.', [
                        ..uriDirectories.Select(part => part.Replace('-', '_')),
                        uriFilename
                    ]);

                    var streamKey = $"{AssemblyStaticPrefix}{assemblyActionAndRest}";
                    var stream = Assembly.GetManifestResourceStream(streamKey)
                        ?? throw new ArgumentException($"Stream not found for key {streamKey}, uri {uri}");
                    contentTypeProvider.Mappings.TryGetValue(uriFilenameExt, out var contentType);

                    context.Response.ContentType = contentType;
                    await stream.CopyToAsync(context.Response.Body);
                }
            }
            catch
            {
                // await ExceptionHandlingMiddleware.WriteExceptionResponse(context, ex);
                throw;
            }
        });

        return () => server.RunAsync();
    }

    private static void SetupWindow(PhotinoWindow window, string baseUrl)
    {
        using Stream? iconStream = Assembly.GetManifestResourceStream($"{AssemblyStaticPrefix}icon.png");

        var tmpIconFilepath = Path.Combine(Path.GetTempPath(), $"pkvault-icon.png");

        using var fileStream = File.Create(tmpIconFilepath);
        iconStream.CopyTo(fileStream);

        window
            .SetTitle("PKVault")
            // Windows only: resize to a percentage of the main monitor work area
            .SetUseOsDefaultSize(WindowsOS)
            // Linux only: static initial size
            .SetSize(1280, 755)
            .Center()
            .SetResizable(true)
            .SetIconFile(tmpIconFilepath)
            // .RegisterCustomSchemeHandler("app", (sender, scheme, url, out contentType) =>
            // {
            //     log.LogInformation("APP => " + url);

            //     contentType = "text/html";
            //     return new MemoryStream(Encoding.UTF8.GetBytes(@"<html>foo</html>"));
            // })
            .RegisterWindowCreatedHandler((sender, e) =>
            {
                // remove created temp icon since not useful anymore
                if (File.Exists(tmpIconFilepath))
                    File.Delete(tmpIconFilepath);
            })
            .Load(baseUrl + $"/index.html");
    }

    private static void InjectIntoFrontend(PhotinoWindow window)
    {
        window.RegisterWebMessageReceivedHandler(async (sender, message) =>
        {
            Log.Logger.Debug($"Message received: {message}");
            if (string.IsNullOrEmpty(message))
            {
                return;
            }

            try
            {
                var desktopRequest = JsonSerializer.Deserialize(message, messageJsonContext.DesktopRequestMessage);

                string responseSerialized = "";

                switch (desktopRequest.type)
                {
                    case FileExploreRequestMessage.TYPE:
                        {
                            var fileExploreRequest = JsonSerializer.Deserialize(message, messageJsonContext.FileExploreRequestMessage);

                            var appBasePath = MatcherUtil
                                    .NormalizePath(SettingsService.GetAppDirectory())
                                    .Replace('/', '\\');

                            string? GetDefaultPath()
                            {
                                if (fileExploreRequest.basePath == default)
                                {
                                    return null;
                                }

                                return MatcherUtil
                                    .NormalizePath(Path.Combine(appBasePath, fileExploreRequest.basePath))
                                    .Replace('/', '\\');
                            }

                            string ToRelative(string path)
                            {
                                path = MatcherUtil
                                    .NormalizePath(path)
                                    .Replace('/', '\\');

                                if (path.StartsWith(appBasePath))
                                {
                                    var pathWithoutBase = MatcherUtil.NormalizePath(path[appBasePath.Length..]);
                                    if (pathWithoutBase[0] == '/')
                                    {
                                        pathWithoutBase = pathWithoutBase[1..];
                                    }
                                    return MatcherUtil.NormalizePath(
                                        Path.Combine(".", pathWithoutBase)
                                    );
                                }

                                return MatcherUtil.NormalizePath(path);
                            }

                            async Task<FileExploreResponseMessage> GetDialogResponse()
                            {
                                var results = await fileChooser.ShowChooserAsync(
                                    window,
                                    directoryOnly: fileExploreRequest.directoryOnly,
                                    multiSelect: fileExploreRequest.multiselect,
                                    defaultPath: GetDefaultPath()
                                );

                                return new(
                                    type: fileExploreRequest.type,
                                    id: fileExploreRequest.id,
                                    directoryOnly: fileExploreRequest.directoryOnly,
                                    values: [.. results.Select(ToRelative)]
                                );
                            }

                            var response = await GetDialogResponse();
                            responseSerialized = JsonSerializer.Serialize(response, messageJsonContext.FileExploreResponseMessage);
                            break;
                        }
                    case OpenFolderRequestMessage.TYPE:
                        {
                            var openFolderRequest = JsonSerializer.Deserialize(message, messageJsonContext.OpenFolderRequestMessage);

                            var normalizedPath = MatcherUtil.NormalizePath(Path.Combine(SettingsService.GetAppDirectory(), openFolderRequest.path));

                            var path = normalizedPath.Replace('/', '\\');

                            if (WindowsOS)
                            {
                                var arg = openFolderRequest.isDirectory
                                    ? path
                                    : string.Format("/e, /select, \"{0}\"", path);

                                var psi = new ProcessStartInfo
                                {
                                    FileName = "explorer.exe",
                                    Arguments = arg,
                                    UseShellExecute = false
                                };

                                Log.Logger.Debug($"RUN explorer.exe {arg}");

                                Process.Start(psi)?.WaitForInputIdle();
                            }
                            else if (LinuxOS)
                            {
                                // xdg can open only folders
                                var arg = $"\"{(
                                    openFolderRequest.isDirectory
                                        ? MatcherUtil.NormalizePath(path)
                                        : Path.GetDirectoryName(MatcherUtil.NormalizePath(path))!
                                )}\"";

                                var psi = new ProcessStartInfo
                                {
                                    FileName = "xdg-open",
                                    Arguments = arg,
                                    UseShellExecute = false
                                };

                                Log.Logger.Debug($"RUN xdg-open {arg}");
                                try
                                {
                                    // Careful: WaitForInputIdle() causes crash on Linux
                                    Process.Start(psi);
                                }
                                catch
                                {
                                    // if xdg-open doesn't work, try something else
                                    var fallback = new ProcessStartInfo
                                    {
                                        FileName = openFolderRequest.path,
                                        UseShellExecute = true
                                    };
                                    Process.Start(fallback);
                                }
                            }
                            else if (MacOS)
                            {
                                // `open -R` reveals and selects a file/folder in Finder
                                var arg = $"-R \"{MatcherUtil.NormalizePath(normalizedPath)}\"";

                                var psi = new ProcessStartInfo
                                {
                                    FileName = "open",
                                    Arguments = arg,
                                    UseShellExecute = false
                                };

                                Log.Logger.Debug($"RUN open {arg}");
                                Process.Start(psi);
                            }
                            else
                            {
                                throw new PlatformNotSupportedException($"OS not supported: {RuntimeInformation.OSDescription}");
                            }
                            break;
                        }
                    case StartFinishRequestMessage.TYPE:
                        {
                            // var startFinishRequest = JsonSerializer.Deserialize(message, messageJsonContext.StartFinishRequestMessage);
                            // fullStartupTime.Dispose();

                            break;
                        }
                }

                if (responseSerialized == "")
                {
                    return;
                }

                if (WindowsOS)
                {
                    responseSerialized = responseSerialized.Replace("\\", "\\\\");
                }

                var data = $"{{ \"detail\": {responseSerialized} }}";

                await window.SendWebMessageAsync(data);

                Log.Logger.Debug($"Response = {data}");
            }
            catch (JsonException ex)
            {
                Log.Error(ex, "JsonException during frontend message recept");
            }
        });
    }
}
