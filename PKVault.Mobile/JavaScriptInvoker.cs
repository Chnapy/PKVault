using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;
using PKVault.Core;
using Serilog;

namespace PKVault.Mobile;

public class JavaScriptInvoker(IServiceProvider ServiceProvider, Task SetupTask)
{
    public record FetchRequestInit(
        string method,
        Dictionary<string, string> headers,
        string? body = null
    );

    public record FetchResponse(
        string url,
        int status,
        string statusText,
        bool ok,
        Dictionary<string, string> headers,
        string? body = null
    );

    public record DesktopRequestMessage
    (
        string type, //'file-explore' | 'open-folder'
        int? id = null,
        bool directoryOnly = false,
        string? basePath = null,
        string? title = null,
        bool multiselect = false
    )
    {
        public const string FILE_EXPLORE_TYPE = "file-explore";
        public const string OPEN_FOLDER_TYPE = "open-folder";
    };

    public record DesktopResponseMessage
    (
        string type, //'file-explore'
        int id,
        bool directoryOnly = false,
        string[]? values = null
    );

    public async Task<FetchResponse> Fetch(string url, FetchRequestInit? requestInit)
    {
        Console.WriteLine($"FETCH {url} {JsonSerializer.Serialize(requestInit)}");

        await SetupTask;
        using var scope = ServiceProvider.CreateScope();
        var coreRouter = scope.ServiceProvider.GetRequiredService<CoreRouter>();

        var uri = new Uri(url);

        requestInit ??= new("GET", []);

        var path = uri.LocalPath;
        string queryString = uri.Query;
        var reqBody = new MemoryStream(Encoding.UTF8.GetBytes(requestInit.body ?? ""));

        var result = await coreRouter.Dispatch(scope.ServiceProvider, requestInit.method, path, queryString, reqBody);

        var response = new FetchResponse(
            url,
            status: result.StatusCode,
            statusText: "OK",
            ok: result.StatusCode < 400,
            headers: result.Header?.ToDictionary() ?? []
        );

        if (result is CoreFileResponse fileResponse)
        {
            // var contentDispositionHeader = new System.Net.Mime.ContentDisposition()
            // {
            // 	FileName = fileResponse.File.FileName,
            // 	DispositionType = "attachment"
            // };
            // headers["Content-Disposition"] = contentDispositionHeader.ToString();

            // if (fileResponse.LastModified is not null)
            // 	headers["LastModified"] = fileResponse.LastModified.ToString()!;

            // await using var stream = fileResponse.File.Stream;
            // await stream.CopyToAsync(body);
        }

        else if (result is CoreJSONResponse jsonResponse)
        {
            if (jsonResponse.Data is not null)
            {
                var typeInfo = RouteJsonContext.DefaultWithOptions.GetTypeInfo(jsonResponse.Data.GetType())
                    ?? throw new InvalidOperationException($"Missing TypeInfo for type {jsonResponse.Data.GetType()}");

                response = response with
                {
                    body = JsonSerializer.Serialize(jsonResponse.Data, typeInfo)
                };
            }
        }

        else
        {
            throw new Exception($"Unhandled request {requestInit.method} {url}");
        }

        // body.Position = 0;
        return response;
    }

    public async Task<DesktopResponseMessage?> SendMessage(DesktopRequestMessage request)
    {
        Console.WriteLine($"REQUEST TYPE = {request.type}");
        try
        {
            DesktopResponseMessage? response = null;

            switch (request.type)
            {
                case DesktopRequestMessage.FILE_EXPLORE_TYPE:
                    {
                        var appBasePath = MatcherUtil
                                .NormalizePath(SettingsService.GetAppDirectory())
                                .Replace('/', '\\');

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

                        async Task<DesktopResponseMessage> GetDialogResponse()
                        {
                            string[] results = [];

                            if (request.directoryOnly)
                            {
#if WINDOWS
                                var folderPicker = new Windows.Storage.Pickers.FolderPicker();
                                folderPicker.FileTypeFilter.Add("*");

                                var hwnd = ((MauiWinUIWindow?)Application.Current?.Windows[0].Handler.PlatformView)?.WindowHandle;
                                if (hwnd is not null)
                                    WinRT.Interop.InitializeWithWindow.Initialize(folderPicker, (nint)hwnd);

                                var folder = await folderPicker.PickSingleFolderAsync();
                                results = [folder.Path];
#endif
                            }
                            else if (request.multiselect)
                            {
                                var files = await FilePicker.Default.PickMultipleAsync();
                                results = files.OfType<FileResult>().Select(f => f.FullPath).ToArray();
                            }
                            else
                            {
                                var file = await FilePicker.Default.PickAsync();
                                if (file != null)
                                    results = [file.FullPath];
                            }

                            return new(
                                type: request.type,
                                id: request.id ?? 0,
                                directoryOnly: request.directoryOnly,
                                values: [.. results.Select(ToRelative)]
                            );
                        }

                        response = await GetDialogResponse();
                        // responseSerialized = JsonSerializer.Serialize(response, messageJsonContext.FileExploreResponseMessage);
                        break;
                    }
                case DesktopRequestMessage.OPEN_FOLDER_TYPE:
                    {
                        ArgumentException.ThrowIfNullOrWhiteSpace(request.basePath);

                        var normalizedPath = MatcherUtil.NormalizePath(Path.Combine(SettingsService.GetAppDirectory(), request.basePath));

                        var path = normalizedPath.Replace('/', '\\');

                        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                        {
                            var arg = request.directoryOnly
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
                        // else if (MacOS)
                        // {
                        // 	// `open -R` reveals and selects a file/folder in Finder
                        // 	var arg = $"-R \"{MatcherUtil.NormalizePath(normalizedPath)}\"";

                        // 	var psi = new ProcessStartInfo
                        // 	{
                        // 		FileName = "open",
                        // 		Arguments = arg,
                        // 		UseShellExecute = false
                        // 	};

                        // 	Log.Logger.Debug($"RUN open {arg}");
                        // 	Process.Start(psi);
                        // }
                        else
                        {
                            throw new PlatformNotSupportedException($"OS not supported: {RuntimeInformation.OSDescription}");
                        }
                        break;
                    }
            }

            // var data = $"{{ \"detail\": {responseSerialized} }}";

            // await window.SendWebMessageAsync(data);

            Log.Logger.Debug($"Response = {response}");
            // return data;
            return response;
        }
        catch (JsonException ex)
        {
            Log.Error(ex, "JsonException during frontend message recept");
            return null;
        }
    }
}