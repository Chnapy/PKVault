using System.IO.Compression;
using System.Security.Cryptography.X509Certificates;
using System.Text.Json;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.Extensions.Primitives;
using PKVault.Core;
using Serilog;

namespace PKVault.Backend;

public class Program
{
    private static Task? SetupTask = null;

    public static async Task Main(string[] args)
    {
        Core.Program.Initialize();

        try
        {
            var time = Log.Logger.Time($"Setup backend load");

            var app = await PrepareWebApp(5000);
            SetupTask = Core.Program.SetupData(app.Services);
            time.Dispose();

            await app.RunAsync();
        }
        catch (Exception ex)
        {
            Log.Fatal(ex, "An unhandled exception occurred during startup");
        }
        finally
        {
            Core.Program.Dispose();
        }
    }

    public static async Task<WebApplication> PrepareWebApp(int port)
    {
        var builder = WebApplication.CreateBuilder([]);
        ConfigureServices(builder.Services);

        builder.WebHost.ConfigureKestrel(serverOptions =>
        {
            serverOptions.ListenAnyIP(port);
        });

        var app = builder.Build();

        app.Map("{*path}", async (HttpContext context) =>
        {
            await SetupTask!;

            using var scope = app.Services.CreateScope();
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
        });

        app.UseRateLimiter();

        app.UseResponseCompression();

        return app;
    }

    public static void ConfigureServices(IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
            {
                var method = httpContext.Request.Method;
                bool isMutation = HttpMethods.IsPost(method)
                    || HttpMethods.IsPut(method)
                    || HttpMethods.IsDelete(method);

                if (!isMutation)
                    return RateLimitPartition.GetNoLimiter("no-limit");

                return RateLimitPartition.GetConcurrencyLimiter("mutations", _ => new ConcurrencyLimiterOptions
                {
                    PermitLimit = 1,
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    QueueLimit = 5
                });
            });

            options.OnRejected = (context, _) =>
            {
                var logger = context.HttpContext.RequestServices
                    .GetRequiredService<ILoggerFactory>()
                    .CreateLogger("RateLimiter");
                logger.LogWarning($"Mutation rejected (queue is full) on {context.HttpContext.Request.Path}");
                return ValueTask.CompletedTask;
            };
        });

        services.AddResponseCompression(opts =>
        {
            opts.Providers.Add<BrotliCompressionProvider>();
            opts.Providers.Add<GzipCompressionProvider>();
            opts.EnableForHttps = true;
        });

        services.Configure<BrotliCompressionProviderOptions>(options =>
        {
            options.Level = CompressionLevel.Optimal;
        });

        services.Configure<GzipCompressionProviderOptions>(options =>
        {
            options.Level = CompressionLevel.Optimal;
        });

        Core.Program.ConfigureServices(services);

        if (EnvUtil.DEMO_MODE)
            services.AddHostedService<DemoCleanupService>();

        Log.Information($"Setup services - Finished");
    }
}
