using System.Reflection;
using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace PKVault.WinForm;

partial class MainForm
{
    /// <summary>
    /// Required designer variable.
    /// </summary>
    private System.ComponentModel.IContainer components = null;

    private WebView2 webView;
    private HttpClient backendClient;

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
        webView = new Microsoft.Web.WebView2.WinForms.WebView2();
        ((System.ComponentModel.ISupportInitialize)webView).BeginInit();
        SuspendLayout();
        // 
        // webView21
        // 
        webView.AllowExternalDrop = true;
        webView.CreationProperties = null;
        webView.DefaultBackgroundColor = Color.White;
        webView.Location = new Point(0, 0);
        webView.Margin = new Padding(0);
        webView.Name = "webView";
        webView.Size = new Size(800, 450);
        // webView.Source = new Uri("", UriKind.Relative);
        webView.TabIndex = 0;
        webView.ZoomFactor = 1D;
        // 
        // MainForm
        // 
        AutoScaleDimensions = new SizeF(7F, 15F);
        AutoScaleMode = AutoScaleMode.Font;
        ClientSize = new Size(800, 450);
        Controls.Add(webView);
        Name = "MainForm";
        Text = "PKVault";
        ((System.ComponentModel.ISupportInitialize)webView).EndInit();
        ResumeLayout(false);
    }

    #endregion

    private async void WebView_Load(object sender, EventArgs e)
    {
        backendClient = Backend.Program.SetupFakeClient();

        await webView.EnsureCoreWebView2Async(null);

        string tempFolder = Path.Combine(Path.GetTempPath(), "pkvault");
        Directory.Delete(tempFolder, true);
        Directory.CreateDirectory(tempFolder);

        var assembly = Assembly.GetExecutingAssembly();
        var resourceNames = assembly.GetManifestResourceNames();
        var expectedPrefix = "PKVault.WinForm.wwwroot.";

        foreach (var resourceName in resourceNames)
        {
            using Stream stream = assembly.GetManifestResourceStream(resourceName);
            if (stream == null || !resourceName.Contains(expectedPrefix))
                continue;

            var relativeResourceName = resourceName.Substring(expectedPrefix.Length);
            var partsRaw = relativeResourceName.Split('.');
            var filename = string.Join('.', partsRaw.Take(new Range(partsRaw.Length - 2, partsRaw.Length)));

            string folderPath = Path.Combine(tempFolder, Path.Combine(partsRaw.Take(partsRaw.Length - 2).ToArray()));

            Directory.CreateDirectory(folderPath);

            string fullPath = Path.Combine(folderPath, filename);

            using FileStream fileStream = new FileStream(fullPath, FileMode.Create, FileAccess.Write);
            stream.CopyTo(fileStream);
        }

        webView.CoreWebView2.SetVirtualHostNameToFolderMapping(
            "pkvault",
            tempFolder,
            CoreWebView2HostResourceAccessKind.Allow);

        webView.CoreWebView2.AddWebResourceRequestedFilter("*/api/*", CoreWebView2WebResourceContext.All);

        webView.CoreWebView2.WebResourceRequested += async (sender, args) =>
        {
            var uri = args.Request.Uri;
            if (!uri.Contains("/api/"))
            {
                return;
            }

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

            async Task<HttpResponseMessage> GetOptionsResponse()
            {
                var res = await backendClient.GetAsync(uri);

                res.StatusCode = System.Net.HttpStatusCode.NoContent;
                res.ReasonPhrase = "OK";
                res.Content = new StringContent("");

                res.Headers.Add("Access-Control-Allow-Methods",
                    args.Request.Headers.GetHeader("access-control-request-method")
                );

                return res;
            }

            var response = args.Request.Method switch
            {
                "GET" => await backendClient.GetAsync(uri),
                "PUT" => await backendClient.PutAsync(uri, GetRequestContent()),
                "POST" => await backendClient.PostAsync(uri, GetRequestContent()),
                "PATCH" => await backendClient.PatchAsync(uri, GetRequestContent()),
                "DELETE" => await backendClient.DeleteAsync(uri),
                "OPTIONS" => await GetOptionsResponse(),
                _ => throw new Exception("Not handled")
            };

            args.Response = await ConvertHttpResponseMessageToWebResourceResponse(response);

            args.Response.Headers.AppendHeader("Access-Control-Allow-Origin", "*");

            deferral.Complete();
        };

        webView.CoreWebView2.Navigate("https://pkvault/index.html");
    }

    private async Task<CoreWebView2WebResourceResponse> ConvertHttpResponseMessageToWebResourceResponse(
        HttpResponseMessage httpResponse
    )
    {
        Stream contentStream = await httpResponse.Content.ReadAsStreamAsync();

        var memoryStream = new MemoryStream();
        await contentStream.CopyToAsync(memoryStream);
        memoryStream.Position = 0;

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

        CoreWebView2WebResourceResponse webResourceResponse =
            webView.CoreWebView2.Environment.CreateWebResourceResponse(memoryStream,
                                         (int)httpResponse.StatusCode,
                                         httpResponse.ReasonPhrase,
                                         headers);

        return webResourceResponse;
    }

    private void Form_Resize(object sender, EventArgs e)
    {
        webView.Size = this.ClientSize - new System.Drawing.Size(webView.Location);
    }
}
