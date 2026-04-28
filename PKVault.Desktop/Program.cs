using System.Diagnostics;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Text.Encodings.Web;
using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.StaticFiles;
using Photino.NET;
using Photino.NET.Server;
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

    [STAThread]
    static void Main(string[] args)
    {
        LogUtil.Initialize();

        try {
            Backend.Program.Copyright();

            var window = new PhotinoWindow();

            var staticServerRun = SetupStaticAssetsServer(out var baseUrl);
            _ = staticServerRun();

            var server = new LocalWebServer();

            window.RegisterWindowCreatedHandler(async (sender, e) =>
            {
                Log.Logger.Debug("CREATED");

                var backendServerPostRun = await SetupBackendServer(server, args);
                await backendServerPostRun();

            });
            window.RegisterWindowClosingHandler((sender, e) =>
            {
                var emptyActionList = server.HasEmptyActionList();

                if (!emptyActionList)
                {
                    var result = window.ShowMessage("PKVault", "You have unsaved changes. Are you sure ?", PhotinoDialogButtons.OkCancel);
                    if (result == PhotinoDialogResult.Cancel)
                    {
                        return true;
                    }
                }

                _ = server.Stop();

                return false;
            });
            // window.RegisterWindowCreatingHandler((sender, e) =>
            // {
            //     log.LogInformation("CREATING");

            // });

            SetupWindow(window, baseUrl);

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

    private static async Task<Func<Task>> SetupBackendServer(LocalWebServer server, string[] args)
    {
        var setupPostRun = await server.Start(args);

        return setupPostRun
            ?? (async () => { });
    }

    private static Func<Task> SetupStaticAssetsServer(out string baseUrl)
    {
        var server = PhotinoServer.CreateStaticFileServer([], out baseUrl);

        var contentTypeProvider = new FileExtensionContentTypeProvider();

        server.Map("{**catchAll}", async context =>
        {
            // log.LogInformation("GET => " + context.Request.Path.Value);
            // log.LogInformation(context.Request.GetDisplayUrl());
            // log.LogInformation(context.Request.GetEncodedUrl());

            // http://localhost:8000/api/storage/main/pkm-version
            // http://localhost:8000/index.html?server=http://localhost:57471
            var uri = context.Request.GetDisplayUrl();
            // log.LogInformation($"DEBUG {uri}");

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
            var stream = Assembly.GetManifestResourceStream(streamKey);
            if (stream == null)
            {
                Log.Error($"Stream not found for key {streamKey}");
                // args.Response = webView.CoreWebView2.Environment.CreateWebResourceResponse(stream, 404, "Not Found", "");
                return;
            }

            contentTypeProvider.Mappings.TryGetValue(uriFilenameExt, out var contentType);

            context.Response.ContentType = contentType;
            await stream.CopyToAsync(context.Response.Body);
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
            .SetSize(1360, 800)
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
            .Load(baseUrl + $"/index.html?server={LocalWebServer.HOST_URL}");
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
                                if (fileExploreRequest.directoryOnly)
                                {
                                    Log.Logger.Debug($"Directory only");
                                    var dirResults = await window.ShowOpenFolderAsync(
                                        // title: "TEST TITLE",
                                        defaultPath: GetDefaultPath(),
                                        multiSelect: fileExploreRequest.multiselect
                                    );

                                    return new(
                                        type: fileExploreRequest.type,
                                        id: fileExploreRequest.id,
                                        directoryOnly: true,
                                        values: [.. dirResults.Select(ToRelative)]
                                    );
                                }

                                Log.Logger.Debug($"File only");
                                var fileResults = await window.ShowOpenFileAsync(
                                    // title: "TEST TITLE",
                                    defaultPath: GetDefaultPath(),
                                    multiSelect: fileExploreRequest.multiselect
                                );

                                // using var dialogFile = new OpenFileDialog();

                                // dialogFile.Title = fileExploreRequest.title;
                                // dialogFile.Multiselect = fileExploreRequest.multiselect;
                                // if (fileExploreRequest.basePath != default)
                                //     dialogFile.InitialDirectory = fileExploreRequest.basePath;

                                // var dialogResult = dialogFile.ShowDialog();

                                return new(
                                    type: fileExploreRequest.type,
                                    id: fileExploreRequest.id,
                                    directoryOnly: true,
                                    values: [.. fileResults.Select(ToRelative)]
                                );
                            }

                            var response = await GetDialogResponse();
                            responseSerialized = JsonSerializer.Serialize(response, messageJsonContext.FileExploreResponseMessage);
                            break;
                        }
                    case OpenFolderRequestMessage.TYPE:
                        {
                            var openFolderRequest = JsonSerializer.Deserialize(message, messageJsonContext.OpenFolderRequestMessage);

                            var path = MatcherUtil.NormalizePath(Path.Combine(SettingsService.GetAppDirectory(), openFolderRequest.path))
                                .Replace('/', '\\');

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
                Log.Error(ex.ToString());
            }
        });
    }
}
