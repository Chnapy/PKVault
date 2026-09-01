using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text.Encodings.Web;
using System.Text.Json;
using Avalonia.Controls;
using Avalonia.Platform.Storage;
using Serilog;

namespace PKVault.Desktop.Views;

public partial class MainWindow : Window
{
    private readonly LocalWebServer server = new();
    // private readonly IFileChooser _fileChooser = Program.LinuxOS ? new LinuxFileChooser() : new DefaultFileChooser();

    private static readonly DesktopMessageJsonContext messageJsonContext = new(new()
    {
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
    });

    public MainWindow()
    {
        InitializeComponent();

        Closing += MainWindow_OnClosing;
        Opened += async (_, _) => await InitializeAsync();

        WebView.EnvironmentRequested += (sender, args) =>
        {
            #if DEBUG
            // Enable developer tools for all platforms
            args.EnableDevTools = true;
            #endif
            
            // Platform-specific configuration
            // switch (args)
            // {
            //     case WindowsWebView2EnvironmentRequestedEventArgs webView2Args:
            //         webView2Args.IsInPrivateModeEnabled = true;
            //         break;
            //     case AppleWKWebViewEnvironmentRequestedEventArgs appleArgs:
            //         appleArgs.NonPersistentDataStore = true;
            //         break;
            //     case GtkWebViewEnvironmentRequestedEventArgs gtkArgs:
            //         gtkArgs.EphemeralDataManager = true;
            //         break;
            // }
        };
    }

    private async Task InitializeAsync()
    {
        try
        {
            var staticBaseUrl = await StaticAssetsServer.StartAsync();

            var backendPostRun = await server.Start(Program.Args);
            if (backendPostRun != null)
                await backendPostRun();

            WebView.Source = new Uri($"{staticBaseUrl}/index.html?server={LocalWebServer.HOST_URL}");
        }
        catch (Exception ex)
        {
            Log.Fatal(ex, "An unhandled exception occurred post window created");
            throw;
        }
    }

    private void WebView_OnNavigationCompleted(object? sender, WebViewNavigationCompletedEventArgs e)
    {
    }

    private async void WebView_OnWebMessageReceived(object? sender, WebMessageReceivedEventArgs e)
    {
        var message = e.Body;
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
                            var topLevel = GetTopLevel(this);

                            var startLocation = await topLevel.StorageProvider.TryGetFolderFromPathAsync(GetDefaultPath() ?? "");

                            IEnumerable<string> results;

                            if (fileExploreRequest.directoryOnly)
                            {
                                var directories = await topLevel.StorageProvider.OpenFolderPickerAsync(new()
                                {
                                    Title = "Select Folder",
                                    AllowMultiple = fileExploreRequest.multiselect,
                                    SuggestedStartLocation = startLocation,
                                });
                                results = directories.Select(f => f.Path.AbsolutePath);
                            }
                            else
                            {
                                var files = await topLevel.StorageProvider.OpenFilePickerAsync(new()
                                {
                                    Title = "Select File",
                                    AllowMultiple = fileExploreRequest.multiselect,
                                    SuggestedStartLocation = startLocation,
                                });
                                results = files.Select(f => f.Path.AbsolutePath);
                            }

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

                        var path = MatcherUtil.NormalizePath(Path.Combine(SettingsService.GetAppDirectory(), openFolderRequest.path))
                            .Replace('/', '\\');

                        if (Program.WindowsOS)
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
                        else if (Program.LinuxOS)
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

            if (Program.WindowsOS)
            {
                responseSerialized = responseSerialized.Replace("\\", "\\\\");
            }

            var data = $"{{ \"detail\": {responseSerialized} }}";

            await WebView.InvokeScript($"console.log('test send data from desktop', {data})");

            var ev = $"new CustomEvent(\"desktop\", {{detail: {data}}})";

            await WebView.InvokeScript($"""
            window.chrome.webview.dispatchEvent({ev});
            """);
            // await window.SendWebMessageAsync(data);

            Log.Logger.Debug($"Response = {data}");
        }
        catch (JsonException ex)
        {
            Log.Error(ex, "JsonException during frontend message recept");
        }
    }

    private async void MainWindow_OnClosing(object? sender, WindowClosingEventArgs e)
    {
        var emptyActionList = server.HasEmptyActionList();

        if (!emptyActionList)
        {
            var dialog = new ConfirmDialog("You have unsaved changes. Are you sure ?");
            await dialog.ShowDialog(this);
            // var result = window.ShowMessage("PKVault", "You have unsaved changes. Are you sure ?", PhotinoDialogButtons.OkCancel);
            // if (result == PhotinoDialogResult.Cancel)
            //     return;
        }

        await server.Stop();
    }
}
