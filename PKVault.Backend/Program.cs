using System.IO.Compression;
using System.Net;
using System.Net.Sockets;
using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.AspNetCore.ResponseCompression;

namespace PKVault.Backend;

public class Program
{
    public static async Task Main(string[] args)
    {
        LogUtil.Initialize();

        var time = LogUtil.Time($"Setup backend load");

        Copyright();

        var app = PrepareWebApp(5000);
        var setupPostRun = await SetupData(app, args);
        time();
        if (setupPostRun != null)
        {
            var appTask = app.RunAsync();

            var setupPostRunTime = LogUtil.Time($"Setup post-run");

            await setupPostRun();

            setupPostRunTime();

            await appTask;
        }

        LogUtil.Dispose();
    }

    public static void Copyright()
    {
        var (BuildID, Version) = SettingsService.GetBuildInfo();
        Console.WriteLine("PKVault Copyright (C) 2026  Richard Haddad"
        + "\nThis program comes with ABSOLUTELY NO WARRANTY."
        + "\nThis is free software, and you are welcome to redistribute it under certain conditions."
        + "\nFull license can be accessed here: https://github.com/Chnapy/PKVault/blob/main/LICENSE"
        + $"\nPKVault v{Version} BuildID = {BuildID}"
        + $"\nCurrent time UTC = {DateTime.UtcNow}\n");
    }

    public static async Task<Func<Task>?> SetupData(IHost host, string[] args)
    {
        var initialMemoryUsedMB = System.Diagnostics.Process.GetCurrentProcess().WorkingSet64 / 1_000_000;

#if MODE_GEN_POKEAPI
            await host.Services.GetRequiredService<GenStaticDataService>().GenerateFiles();
            return null;
#elif MODE_DEFAULT

        var setupedMemoryUsedMB = System.Diagnostics.Process.GetCurrentProcess().WorkingSet64 / 1_000_000;

        Console.WriteLine($"Memory checks: initial={initialMemoryUsedMB} MB setuped={setupedMemoryUsedMB} MB diff={setupedMemoryUsedMB - initialMemoryUsedMB} MB");

        await host.Services.GetRequiredService<StaticDataService>().GetStaticData();

        if (args.Length > 0 && args[0] == "clean")
        {
            await host.Services.GetRequiredService<MaintenanceService>().CleanMainStorageFiles();
            return null;
        }

        if (args.Length > 0 && args[0] == "test-bkp")
        {
            await host.Services.GetRequiredService<BackupService>().CreateBackup();
            return null;
        }

        return async () =>
        {
            await Task.WhenAll([
                host.Services.GetRequiredService<SaveService>().EnsureInitialized(),
                host.Services.GetRequiredService<LoadersService>().EnsureInitialized(),
            ]);
        };
#else
        throw new Exception("Mode not defined");
#endif
    }

    public static WebApplication PrepareWebApp(int port)
    {
        var builder = WebApplication.CreateBuilder([]);

        ConfigureServices(builder.Services);

        var sp = builder.Services.BuildServiceProvider();
        var fileIOService = sp.GetRequiredService<FileIOService>();
        var settings = sp.GetRequiredService<SettingsService>()
            .GetSettings();

        var certificate = settings.GetHttpsCertPemPathPath() != null && settings.GetHttpsKeyPemPathPath() != null
            ? X509Certificate2.CreateFromPem(
                fileIOService.ReadText(settings.GetHttpsCertPemPathPath()!),
                fileIOService.ReadText(settings.GetHttpsKeyPemPathPath()!)
            )
            : null;

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

        ConfigureAppBuilder(app, certificate != default || settings.SettingsMutable.HTTPS_NOCERT == true);

        return app;
    }

    public static void ConfigureServices(IServiceCollection services)
    {
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

        services
            .AddControllers(options =>
            {
                options.Conventions.Add(new RouteTokenTransformerConvention(new SlugifyParameterTransformer()));
            })
            // required by PublishedTrimmed
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.TypeInfoResolver = RouteJsonContext.Default;
            });

#if MODE_GEN_POKEAPI
        services.AddSingleton<PokeApiService>();
        services.AddSingleton<GenSpritesheetService>();
        services.AddSingleton<GenStaticDataService>();
#endif

        services.AddSingleton<StaticDataService>();
        services.AddSingleton<FileIOService>();
        services.AddSingleton<LoadersService>();
        services.AddSingleton<StorageQueryService>();
        services.AddSingleton<ActionService>();
        services.AddSingleton<MaintenanceService>();
        services.AddSingleton<DexService>();
        services.AddSingleton<WarningsService>();
        services.AddSingleton<BackupService>();
        services.AddSingleton<SaveService>();
        services.AddSingleton<SettingsService>();
        services.AddSingleton<DataService>();
        services.AddSingleton<PkmConvertService>();
        services.AddSingleton<PkmLegalityService>();

#if DEBUG && MODE_DEFAULT
        services.AddEndpointsApiExplorer();
        services.AddSwaggerDocument(document =>
        {
            document.PostProcess = doc =>
            {
                doc.Info.Title = "PKVault API";
            };
        });
#endif
    }

    public static void ConfigureAppBuilder(IApplicationBuilder app, bool useHttps)
    {
        app.UseResponseCompression();

        if (useHttps)
        {
            app.UseHttpsRedirection();
        }

        app.UseRouting();
        app.UseCors(policy => policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());

        app.UseMiddleware<ExceptionHandlingMiddleware>();
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
        });

#if DEBUG && MODE_DEFAULT
        app.UseOpenApi();
        app.UseSwaggerUi();
#endif
    }

    public static int GetAvailablePort()
    {
        var listener = new TcpListener(IPAddress.Loopback, 0);
        listener.Start(); // Demande au système d’attribuer un port libre

        int port = ((IPEndPoint)listener.LocalEndpoint).Port; // Récupère le port attribué

        listener.Stop(); // Libère le port

        return port;
    }
}
