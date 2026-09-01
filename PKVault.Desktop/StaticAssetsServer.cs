using System.Reflection;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Serilog;

namespace PKVault.Desktop;

static class StaticAssetsServer
{
    private const string AssemblyStaticPrefix = "PKVault.Desktop.Resources.wwwroot.";
    private static readonly Assembly Assembly = Assembly.GetExecutingAssembly();

    public static async Task<string> Start()
    {
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseUrls("http://127.0.0.1:0");
        builder.Logging.ClearProviders();
        builder.Environment.EnvironmentName = Environments.Production;

        var server = builder.Build();
        var contentTypeProvider = new FileExtensionContentTypeProvider();

        server.Map("/{**catchAll}", async context =>
        {
            try
            {
                // http://localhost:8000/api/storage/main/pkm-version
                // http://localhost:8000/index.html?server=http://localhost:57471
                var uri = context.Request.GetDisplayUrl();

                if (uri.EndsWith("/.well-known/appspecific/com.chrome.devtools.json"))
                {
                    context.Response.StatusCode = Microsoft.AspNetCore.Http.StatusCodes.Status404NotFound;
                    return;
                }

                var uriParts = uri.Split('?')[0].Split('/');

                var uriActionAndRest = uriParts.Skip(3);
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
            catch (Exception ex)
            {
                await ExceptionHandlingMiddleware.WriteExceptionResponse(context, ex);
            }
        });

        await server.StartAsync();

        var baseUrl = server.Urls.First();
        Log.Logger.Debug($"Static assets server started at {baseUrl}");

        return baseUrl;
    }
}
