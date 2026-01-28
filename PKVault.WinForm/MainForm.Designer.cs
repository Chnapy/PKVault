using System.Diagnostics;
using System.Reflection;
using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;
using Svg;

namespace PKVault.WinForm;

partial class MainForm
{
    /// <summary>
    /// Required designer variable.
    /// </summary>
    private System.ComponentModel.IContainer components = null;

    private WebView2 webView;
    private HttpClient backendClient = new();

    /// <summary>
    /// Clean up any resources being used.
    /// </summary>
    /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
    protected override void Dispose(bool disposing)
    {
        if (disposing && (components != null))
        {
            components.Dispose();
        }
        base.Dispose(disposing);
    }

    #region Windows Form Designer generated code

    /// <summary>
    /// Required method for Designer support - do not modify
    /// the contents of this method with the code editor.
    /// </summary>
    private void InitializeComponent()
    {
        var assembly = Assembly.GetExecutingAssembly();
        using Stream iconStream = assembly.GetManifestResourceStream("PKVault.WinForm.wwwroot.icon.ico");
        using Stream logoStream = assembly.GetManifestResourceStream("PKVault.WinForm.wwwroot.logo.svg");

        webView = new Microsoft.Web.WebView2.WinForms.WebView2();
        ((System.ComponentModel.ISupportInitialize)webView).BeginInit();
        SuspendLayout();


        // webView.CoreWebView2InitializationCompleted += async (sender, args) =>
        // {
        //     Console.WriteLine($"FOOBAR {sender} {args}");
        // };

        var clientSize = new Size(1360, 800);

        // 
        // webView21
        // 
        webView.AllowExternalDrop = true;
        webView.CreationProperties = null;
        webView.DefaultBackgroundColor = Color.White;
        webView.Location = new Point(0, 0);
        webView.Margin = new Padding(0);
        webView.Name = "webView";
        webView.Size = clientSize;
        // webView.Source = new Uri("", UriKind.Relative);
        webView.TabIndex = 0;
        webView.ZoomFactor = 1D;
        webView.DefaultBackgroundColor = Color.Transparent;
        // 
        // Logo
        // 
        var pictureBox = new PictureBox
        {
            Image = SvgDocument.Open<SvgDocument>(logoStream).Draw(128, 128),
            SizeMode = PictureBoxSizeMode.CenterImage,
            Dock = DockStyle.Fill,
            BackColor = Color.Transparent
        };
        // 
        // MainForm
        // 
        AutoScaleDimensions = new SizeF(7F, 15F);
        AutoScaleMode = AutoScaleMode.Font;
        ClientSize = clientSize;
        Controls.Add(webView);
        Controls.Add(pictureBox);
        Name = "MainForm";
        Text = "PKVault";
        BackColor = Color.FromArgb(182, 99, 78);
        Icon = new Icon(iconStream);

        ((System.ComponentModel.ISupportInitialize)webView).EndInit();
        ResumeLayout(false);
    }

    #endregion

    private async Task<bool> WebView_Load()
    {
        using var _ = LogUtil.Time($"Load WebView");

        string webViewVersion;
        try
        {
            webViewVersion = CoreWebView2Environment.GetAvailableBrowserVersionString() ?? "";
            Console.WriteLine($"WebView version = {webViewVersion}");
        }
        catch (Exception ex)
        {
            webViewVersion = "";
            Console.Error.WriteLine(ex);
        }

        // if no webview installed
        if (webViewVersion == "")
        {
            var dialog = new NoWebviewDialog();
            dialog.ShowDialog();
            this.Close();
            return false;
        }

        await webView.EnsureCoreWebView2Async(null);

        var assembly = Assembly.GetExecutingAssembly();
        var expectedPrefix = "PKVault.WinForm.wwwroot.";

        var contentTypeProvider = new FileExtensionContentTypeProvider();

        InjectIntoFrontend();

        webView.CoreWebView2.AddWebResourceRequestedFilter("http://pkvault../*", CoreWebView2WebResourceContext.All);
        webView.CoreWebView2.AddWebResourceRequestedFilter("http://localhost:*", CoreWebView2WebResourceContext.All);

        webView.CoreWebView2.WebResourceRequested += async (sender, args) =>
        {
            // http://localhost:57135/api/storage/main/pkm-version
            // http://pkvault../index.html?server=http://localhost:57471
            var uri = args.Request.Uri;
            // Console.WriteLine($"DEBUG {uri}");

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

            switch (uriAction)
            {
                case "api":
                    await HandleApiRequest(args);
                    break;
                default:
                    var streamKey = $"{expectedPrefix}{assemblyActionAndRest}";
                    var stream = assembly.GetManifestResourceStream(streamKey);
                    if (stream == null)
                    {
                        Console.Error.WriteLine($"Stream not found for key {streamKey}");
                        args.Response = webView.CoreWebView2.Environment.CreateWebResourceResponse(stream, 404, "Not Found", "");
                        break;
                    }

                    contentTypeProvider.Mappings.TryGetValue(uriFilenameExt, out var contentType);

                    args.Response = webView.CoreWebView2.Environment.CreateWebResourceResponse(stream, 200, "OK",
                        contentType == null ? "" : $"Content-Type: {contentType};"
                    );
                    break;
            }
        };

        return true;
    }

    private void WebView_Navigate()
    {
        // specific domain with '..' to bypass webview slow dns resolver
        // @see https://github.com/MicrosoftEdge/WebView2Feedback/issues/2381#issuecomment-3032253958
        var navigateTo = $"http://pkvault../index.html?server={LocalWebServer.HOST_URL}";

        var time = LogUtil.Time($"Navigate WebView to {navigateTo}");

        webView.CoreWebView2.Navigate(navigateTo);
        webView.CoreWebView2.NavigationCompleted += (object sender, CoreWebView2NavigationCompletedEventArgs e) =>
        {
            time.Dispose();
            partialStartupTime.Dispose();
        };
    }

    private async Task HandleApiRequest(CoreWebView2WebResourceRequestedEventArgs args)
    {
        var uri = args.Request.Uri;

        var deferral = args.GetDeferral();

        HttpContent GetRequestContent()
        {
            if (args.Request.Content == null)
            {
                return null;
            }

            HttpContent httpContent = new StreamContent(args.Request.Content);
            foreach (var header in args.Request.Headers)
            {
                httpContent.Headers.TryAddWithoutValidation(header.Key, header.Value);
            }
            return httpContent;
        }

        HttpResponseMessage GetOptionsResponse()
        {
            var requestMethod = args.Request.Headers.GetHeader("access-control-request-method");

            var res = new HttpResponseMessage()
            {
                StatusCode = System.Net.HttpStatusCode.NoContent,
                ReasonPhrase = "No Content",
                RequestMessage = new HttpRequestMessage(new HttpMethod(requestMethod), uri)
            };

            res.Headers.Add("Access-Control-Allow-Methods", requestMethod);
            res.Headers.Add("Access-Control-Allow-Headers", "content-type");
            res.Headers.Add("Access-Control-Allow-Origin", "*");

            return res;
        }

        var response = args.Request.Method switch
        {
            "GET" => await backendClient.GetAsync(uri),
            "PUT" => await backendClient.PutAsync(uri, GetRequestContent()),
            "POST" => await backendClient.PostAsync(uri, GetRequestContent()),
            "PATCH" => await backendClient.PatchAsync(uri, GetRequestContent()),
            "DELETE" => await backendClient.DeleteAsync(uri),
            "OPTIONS" => GetOptionsResponse(),
            _ => throw new Exception("Not handled")
        };

        if (!response.Headers.Contains("Access-Control-Allow-Origin"))
        {
            response.Headers.Add("Access-Control-Allow-Origin", "*");
        }

        args.Response = GetWebResourceResponse(response);

        deferral.Complete();
    }

    private CoreWebView2WebResourceResponse GetWebResourceResponse(
        HttpResponseMessage httpResponse
    )
    {
        var headersBuilder = new System.Text.StringBuilder();
        foreach (var header in httpResponse.Headers)
        {
            headersBuilder.AppendLine($"{header.Key}: {string.Join(", ", header.Value)}");
        }
        foreach (var header in httpResponse.Content.Headers)
        {
            headersBuilder.AppendLine($"{header.Key}: {string.Join(", ", header.Value)}");
        }
        string headers = headersBuilder.ToString();

        var webResourceResponse = webView.CoreWebView2.Environment.CreateWebResourceResponse(
            httpResponse.Content.ReadAsStream(),
            (int)httpResponse.StatusCode,
            httpResponse.ReasonPhrase,
            headers
        );

        return webResourceResponse;
    }

    private void Form_Resize(object sender, EventArgs e)
    {
        webView.Size = this.ClientSize - new System.Drawing.Size(webView.Location);
    }

    private void InjectIntoFrontend()
    {
        webView.CoreWebView2.WebMessageReceived += async (object sender, CoreWebView2WebMessageReceivedEventArgs e) =>
        {
            var message = e.WebMessageAsJson;
            Console.WriteLine($"Message received: {message}");
            try
            {
                var desktopRequest = JsonSerializer.Deserialize(message, DesktopMessageJsonContext.Default.DesktopRequestMessage);

                string responseSerialized = "";

                switch (desktopRequest.type)
                {
                    case FileExploreRequestMessage.TYPE:
                        {
                            var fileExploreRequest = JsonSerializer.Deserialize(message, DesktopMessageJsonContext.Default.FileExploreRequestMessage);

                            FileExploreResponseMessage GetDialogResponse()
                            {
                                if (fileExploreRequest.directoryOnly)
                                {
                                    Console.WriteLine($"Directory only");
                                    using var dialogFolder = new FolderBrowserDialog();

                                    dialogFolder.Description = fileExploreRequest.title;
                                    dialogFolder.Multiselect = fileExploreRequest.multiselect;
                                    if (fileExploreRequest.basePath != default)
                                        dialogFolder.InitialDirectory = fileExploreRequest.basePath;

                                    var dialogFolderResult = dialogFolder.ShowDialog();

                                    return new(
                                        type: fileExploreRequest.type,
                                        id: fileExploreRequest.id,
                                        directoryOnly: true,
                                        values: dialogFolderResult == DialogResult.OK
                                            ? dialogFolder.SelectedPaths
                                                .Select(MatcherUtil.NormalizePath)
                                                .ToArray()
                                            : []
                                    );
                                }

                                Console.WriteLine($"File only");
                                using var dialogFile = new OpenFileDialog();

                                dialogFile.Title = fileExploreRequest.title;
                                dialogFile.Multiselect = fileExploreRequest.multiselect;
                                if (fileExploreRequest.basePath != default)
                                    dialogFile.InitialDirectory = fileExploreRequest.basePath;

                                var dialogResult = dialogFile.ShowDialog();

                                return new(
                                    type: fileExploreRequest.type,
                                    id: fileExploreRequest.id,
                                    directoryOnly: true,
                                    values: dialogResult == DialogResult.OK
                                        ? dialogFile.FileNames
                                            .Select(MatcherUtil.NormalizePath)
                                            .ToArray()
                                        : []
                                );
                            }

                            var response = GetDialogResponse();
                            responseSerialized = JsonSerializer.Serialize(response, DesktopMessageJsonContext.Default.FileExploreResponseMessage);
                            break;
                        }
                    case OpenFolderRequestMessage.TYPE:
                        {
                            var openFolderRequest = JsonSerializer.Deserialize(message, DesktopMessageJsonContext.Default.OpenFolderRequestMessage);

                            var arg = openFolderRequest.isDirectory
                                ? Path.GetFullPath(openFolderRequest.path)
                                : string.Format("/e, /select, \"{0}\"", Path.GetFullPath(openFolderRequest.path));

                            var psi = new ProcessStartInfo
                            {
                                FileName = "explorer.exe",
                                Arguments = arg,
                                UseShellExecute = false
                            };

                            Console.WriteLine($"RUN explorer.exe {arg}");

                            var process = Process.Start(psi);
                            process.WaitForInputIdle();

                            var response = new OpenFolderResponseMessage(
                                type: OpenFolderResponseMessage.TYPE,
                                id: openFolderRequest.id
                            );
                            responseSerialized = JsonSerializer.Serialize(response, DesktopMessageJsonContext.Default.OpenFolderResponseMessage);
                            break;
                        }
                    case StartFinishRequestMessage.TYPE:
                        {
                            // var startFinishRequest = JsonSerializer.Deserialize(message, DesktopMessageJsonContext.Default.StartFinishRequestMessage);
                            fullStartupTime.Dispose();

                            break;
                        }
                }

                if (responseSerialized == "")
                {
                    return;
                }

                responseSerialized = responseSerialized.Replace("\\", "\\\\");
                string script = "try {"
                    + $"\nwindow.dispatchEvent(new CustomEvent('desktop-message', {{ detail: JSON.parse('{responseSerialized}') }}));"
                    + $"\n}} catch(err) {{ console.error('Error with event dispatch from backend, response serialized:', '{responseSerialized}'); }}";
                var result = await webView.ExecuteScriptAsync(script);
                Console.WriteLine($"Script = {script} result= {result}");
            }
            catch (JsonException ex)
            {
                Console.Error.WriteLine(ex);
            }
        };

        // on new window link open, use default browser instead of edge
        webView.CoreWebView2.NewWindowRequested += (sender, args) =>
        {
            args.Handled = true;
            System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
            {
                FileName = args.Uri,
                UseShellExecute = true
            });
        };
    }

}
