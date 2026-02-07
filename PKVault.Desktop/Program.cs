using System.Reflection;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.StaticFiles;
using Photino.NET;
using Photino.NET.Server;

namespace PKVault.Desktop;

//NOTE: To hide the console window, go to the project properties and change the Output Type to Windows Application.
// Or edit the .csproj file and change the <OutputType> tag from "WinExe" to "Exe".
class Program
{
    private static readonly Assembly Assembly = Assembly.GetExecutingAssembly();
    private static readonly string AssemblyStaticPrefix = "PKVault.Desktop.Resources.wwwroot.";

    [STAThread]
    static void Main(string[] args)
    {
        var window = new PhotinoWindow();

        var staticServerRun = SetupStaticAssetsServer(out var baseUrl);
        _ = staticServerRun();

        window.RegisterWindowCreatedHandler(async (sender, e) =>
        {
            Console.WriteLine("CREATED");

            var backendServerPostRun = await SetupBackendServer(args);
            await backendServerPostRun();

        });
        // window.RegisterWindowCreatingHandler((sender, e) =>
        // {
        //     Console.WriteLine("CREATING");

        // });

        SetupWindow(window, baseUrl);

        window.WaitForClose();
    }

    private static async Task<Func<Task>> SetupBackendServer(string[] args)
    {
        var server = new LocalWebServer();
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
            // Console.WriteLine("GET => " + context.Request.Path.Value);
            // Console.WriteLine(context.Request.GetDisplayUrl());
            // Console.WriteLine(context.Request.GetEncodedUrl());

            // http://localhost:8000/api/storage/main/pkm-version
            // http://localhost:8000/index.html?server=http://localhost:57471
            var uri = context.Request.GetDisplayUrl();
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

            var streamKey = $"{AssemblyStaticPrefix}{assemblyActionAndRest}";
            var stream = Assembly.GetManifestResourceStream(streamKey);
            if (stream == null)
            {
                Console.Error.WriteLine($"Stream not found for key {streamKey}");
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
        using Stream? iconStream = Assembly.GetManifestResourceStream($"{AssemblyStaticPrefix}icon.ico");

        var tmpIconFilepath = Path.Combine(Path.GetTempPath(), $"photino-icon.ico");

        using var fileStream = File.Create(tmpIconFilepath);
        iconStream.CopyTo(fileStream);

        window
            .SetTitle("PKVault")
            // Resize to a percentage of the main monitor work area
            .SetUseOsDefaultSize(true)
            // .SetSize(1360, 800)
            .Center()
            .SetResizable(true)
            .SetIconFile(tmpIconFilepath)
            // .RegisterCustomSchemeHandler("app", (sender, scheme, url, out contentType) =>
            // {
            //     Console.WriteLine("APP => " + url);

            //     contentType = "text/html";
            //     return new MemoryStream(Encoding.UTF8.GetBytes(@"<html>foo</html>"));
            // })
            .RegisterWindowCreatedHandler((sender, e) =>
            {
                // remove created temp icon since not useful anymore
                if (File.Exists(tmpIconFilepath))
                    File.Delete(tmpIconFilepath);
            })
            .RegisterWebMessageReceivedHandler((sender, message) =>
            {
                var window = (PhotinoWindow)sender!;

                string response = $"Received message: \"{message}\"";

                window.SendWebMessage(response);
            })
            .Load(baseUrl + $"/index.html?server={LocalWebServer.HOST_URL}");
    }
}
