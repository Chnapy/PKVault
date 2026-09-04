using System.IO.Compression;
using System.Net;
using System.Net.Sockets;
using System.Security.Cryptography.X509Certificates;
using System.Text.Json;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.Extensions.Primitives;
using Serilog;

namespace PKVault.Backend;

public class Program
{
    public static async Task Main(string[] args)
    {
        PKVault.Core.Program.Initialize();

        try
        {
            var time = Log.Logger.Time($"Setup backend load");

            var app = await PrepareWebApp(5000);
            var setupPostRun = await SetupData(app, args);
            time.Dispose();

            if (setupPostRun != null)
            {
                var appTask = app.RunAsync();

                var setupPostRunTime = Log.Logger.Time($"Setup post-run");

                await setupPostRun();

                setupPostRunTime.Dispose();

                await appTask;
            }
        }
        catch (Exception ex)
        {
            Log.Fatal(ex, "An unhandled exception occurred during startup");
        }
        finally
        {
            PKVault.Core.Program.Dispose();
        }
    }

    public static async Task<Func<Task>?> SetupData(IHost host, string[] args)
    {
        return await PKVault.Core.Program.SetupData(host.Services);
    }

    public static async Task<WebApplication> PrepareWebApp(int port)
    {
        var builder = WebApplication.CreateBuilder([]);

        ConfigureServices(builder.Services);

        var sp = builder.Services.BuildServiceProvider();
        var fileIOService = sp.GetRequiredService<PKVault.Core.IFileIOService>();
        var settings = sp.GetRequiredService<PKVault.Core.ISettingsService>()
            .GetSettings();

        X509Certificate2? GetCertificate()
        {
            var certPemPath = settings.GetHttpsCertPemPathPath();
            var keyPemPath = settings.GetHttpsKeyPemPathPath();

            return certPemPath != null && keyPemPath != null
                ? X509Certificate2.CreateFromPem(certPemPath, keyPemPath)
                : null;
        }

        var certificate = GetCertificate();

        builder.WebHost.ConfigureKestrel(serverOptions =>
        {
            serverOptions.ListenAnyIP(port, listenOptions =>
            {
                if (certificate != default)
                {
                    listenOptions.UseHttps(certificate);
                }
                else if (settings.SettingsMutable.HTTPS_NOCERT == true)
                {
                    listenOptions.UseHttps();
                }

            });
        });

        var app = builder.Build();

        app.Map("{*path}", async (HttpContext context) =>
        {
            string queryString = "";

            // Extrait les paramètres de QueryString si présents (ex: GET /api/backup?createdAt=2026-01-01)
            if (context.Request.QueryString.HasValue)
            {
                // Console.WriteLine($"QUERIES = {context.Request.QueryString.Value} - {context.Request.QueryString.ToUriComponent()}");
                queryString = context.Request.QueryString.Value;
            }

            using var scope = app.Services.CreateScope();

            var coreRouter = scope.ServiceProvider.GetRequiredService<PKVault.Core.CoreRouter>();

            var result = await coreRouter.Dispatch(scope.ServiceProvider, context.Request.Method, context.Request.Path, queryString, context.Request.Body);

            // Console.WriteLine($"METHOD={context.Request.Method} PATH={context.Request.Path} QUERY={
            //     string.Join(',',context.Request.Query.Select(q => $"{q.Key}:{JsonSerializer.Serialize(q.Value)}"))
            // } BODY={body}");

            context.Response.StatusCode = result.StatusCode ?? 200;

            if (result.Header is not null)
                foreach (var (key, values) in result.Header)
                    context.Response.Headers[key] = values;

            if (result is PKVault.Core.CoreFileResponse fileResponse)
            {
                context.Response.ContentType = fileResponse.ContentType ?? "application/octet-stream";

                var contentDispositionHeader = new System.Net.Mime.ContentDisposition()
                {
                    FileName = fileResponse.File.FileName,
                    DispositionType = "attachment"
                };
                context.Response.Headers.Append("Content-Disposition", contentDispositionHeader.ToString());

                if (fileResponse.LastModified is not null)
                    context.Response.GetTypedHeaders().LastModified = fileResponse.LastModified;

                await using var stream = fileResponse.File.Stream;
                await stream.CopyToAsync(context.Response.Body);
            }

            else if (result is PKVault.Core.CoreJSONResponse jsonResponse)
            {
                context.Response.ContentType = jsonResponse.ContentType ?? "application/json";
                if (jsonResponse.Data is not null)
                {
                    var ctx = new PKVault.Core.RouteJsonContext(new()
                    {
                        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                        TypeInfoResolver = PKVault.Core.RouteJsonContext.Default
                    });

                    var typeInfo = ctx.GetTypeInfo(jsonResponse.Data.GetType())
                        ?? throw new InvalidOperationException(
                            $"Type {jsonResponse.Data.GetType()} non enregistré dans RouteJsonContext.");

                    await JsonSerializer.SerializeAsync(
                        context.Response.Body,
                        jsonResponse.Data,
                        typeInfo
                    );
                }
            }
        });

        ConfigureAppBuilder(app, certificate != default || settings.SettingsMutable.HTTPS_NOCERT == true);

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

        PKVault.Core.Program.ConfigureServices(services);

        if (EnvUtil.DEMO_MODE)
            services.AddHostedService<DemoCleanupService>();

        Log.Information($"Setup services - Finished");
    }

    public static void ConfigureAppBuilder(IApplicationBuilder app, bool useHttps)
    {
        app.UseRateLimiter();

        app.UseResponseCompression();

        if (useHttps)
        {
            app.UseHttpsRedirection();
        }
    }

    public static int GetAvailablePort()
    {
        var listener = new TcpListener(IPAddress.Loopback, 0);
        listener.Start();

        int port = ((IPEndPoint)listener.LocalEndpoint).Port;

        listener.Stop();

        return port;
    }

    public static bool HasEmptyActionList(IHost host)
    {
        return host.Services.GetRequiredService<ISessionService>().HasEmptyActionList();
    }
}
