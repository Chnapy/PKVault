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

    private async Task WebView_Load()
    {
        await webView.EnsureCoreWebView2Async(null);

        var assembly = Assembly.GetExecutingAssembly();
        var expectedPrefix = "PKVault.WinForm.wwwroot.";

        var contentTypeProvider = new FileExtensionContentTypeProvider();

        webView.CoreWebView2.AddWebResourceRequestedFilter("https://pkvault/*", CoreWebView2WebResourceContext.All);
        webView.CoreWebView2.AddWebResourceRequestedFilter("https://localhost:*", CoreWebView2WebResourceContext.All);

        webView.CoreWebView2.WebResourceRequested += async (sender, args) =>
        {
            // https://localhost:57135/api/storage/main/pkm-version
            // https://pkvault/index.html?server=https://localhost:57471
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
                    Stream stream = assembly.GetManifestResourceStream(streamKey)
                        ?? throw new Exception($"Stream not found for key {streamKey}");

                    contentTypeProvider.Mappings.TryGetValue(uriFilenameExt, out var contentType);

                    args.Response = webView.CoreWebView2.Environment.CreateWebResourceResponse(stream, 200, "OK",
                        contentType == null ? "" : $"Content-Type: {contentType};"
                    );
                    break;
            }
        };
    }

    private void WebView_Navigate()
    {
        var navigateTo = $"https://pkvault/index.html?server={LocalWebServer.HOST_URL}";

        Console.WriteLine($"Navigate WebView to {navigateTo}");

        webView.CoreWebView2.Navigate(navigateTo);
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
}
