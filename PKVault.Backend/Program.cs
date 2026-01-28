using System.IO.Abstractions;
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

#if MODE_GEN_MIGRATION
        if (!Microsoft.EntityFrameworkCore.EF.IsDesignTime)
        {
            await MigrationUtil.AddMigrationTrimmedCompatible(args[0]);
            return;
        }
#endif

        var time = LogUtil.Time($"Setup backend load");

        Copyright();

        var app = await PrepareWebApp(5000);
        var setupPostRun = await SetupData(app, args);
        time.Stop();

        if (setupPostRun != null)
        {
            var appTask = app.RunAsync();

            var setupPostRunTime = LogUtil.Time($"Setup post-run");

            await setupPostRun();

            setupPostRunTime.Stop();

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
                host.Services.GetRequiredService<ISaveService>().EnsureInitialized(),
                host.Services.GetRequiredService<SessionService>().EnsureSessionCreated(),
            ]);
        };
#else
        throw new Exception("Mode not defined");
#endif
    }

    public static async Task<WebApplication> PrepareWebApp(int port)
    {
        var builder = WebApplication.CreateBuilder([]);

        builder.Logging.ClearProviders();
        builder.Logging.AddConsole();
        LogUtil.BuilderLoggingFilters.ForEach(filter =>
        {
            builder.Logging.AddFilter(filter.category, filter.level);
        });

        ConfigureServices(builder.Services);

        var sp = builder.Services.BuildServiceProvider();
        var fileIOService = sp.GetRequiredService<IFileIOService>();
        var settings = sp.GetRequiredService<ISettingsService>()
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

        Console.WriteLine($"Setup services - DB");
        services.AddDbContext<SessionDbContext>();

        services.AddSingleton<SessionService>();
        services.AddSingleton<DbSeedingService>();

        Console.WriteLine($"Setup services - Main");
        services.AddSingleton<IFileSystem>(new FileSystem());
        services.AddSingleton<IFileIOService, FileIOService>();
        services.AddSingleton<StaticDataService>();
        services.AddSingleton<StorageQueryService>();
        services.AddSingleton<ActionService>();
        services.AddSingleton<MaintenanceService>();
        services.AddSingleton<DexService>();
        services.AddSingleton<WarningsService>();
        services.AddSingleton<BackupService>();
        services.AddSingleton<ISaveService, SaveService>();
        services.AddSingleton<ISettingsService, SettingsService>();
        services.AddSingleton<DataService>();
        services.AddSingleton<PkmConvertService>();
        services.AddSingleton<PkmLegalityService>();

        Console.WriteLine($"Setup services - Actions");
        services.AddScoped<DataNormalizeAction>();
        services.AddScoped<SynchronizePkmAction>();
        services.AddScoped<MainCreateBoxAction>();
        services.AddScoped<MainUpdateBoxAction>();
        services.AddScoped<MainDeleteBoxAction>();
        services.AddScoped<MainCreateBankAction>();
        services.AddScoped<MainUpdateBankAction>();
        services.AddScoped<MainDeleteBankAction>();
        services.AddScoped<MovePkmAction>();
        services.AddScoped<MovePkmBankAction>();
        services.AddScoped<MainCreatePkmVersionAction>();
        services.AddScoped<EditPkmVersionAction>();
        services.AddScoped<EditPkmSaveAction>();
        services.AddScoped<DetachPkmSaveAction>();
        services.AddScoped<DeletePkmVersionAction>();
        services.AddScoped<SaveDeletePkmAction>();
        services.AddScoped<EvolvePkmAction>();
        services.AddScoped<SortPkmAction>();
        services.AddScoped<DexSyncAction>();

        Console.WriteLine($"Setup services - Loaders");
        services.AddScoped<IBankLoader, BankLoader>();
        services.AddScoped<IBoxLoader, BoxLoader>();
        services.AddScoped<IPkmVersionLoader, PkmVersionLoader>();
        services.AddScoped<IPkmFileLoader, PkmFileLoader>();
        services.AddScoped<IDexLoader, DexLoader>();
        services.AddSingleton<ISavesLoadersService, SavesLoadersService>();   // singleton for perf reasons

#if DEBUG && MODE_DEFAULT
        services.AddEndpointsApiExplorer();
        services.AddSwaggerDocument(document =>
        {
            document.PostProcess = doc =>
            {
                doc.Info.Title = "PKVault API";

                // Required for PKHeX.Core.Gender which has duplicates
                foreach (var enumSchema in doc.Definitions.Values.Where(s => s.IsEnumeration))
                {
                    var distinctValues = enumSchema.Enumeration.Distinct().ToList();
                    enumSchema.Enumeration.Clear();
                    foreach (var value in distinctValues)
                    {
                        enumSchema.Enumeration.Add(value);
                    }
                }
            };
        });
#endif

        Console.WriteLine($"Setup services - Finished");
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
        listener.Start();

        int port = ((IPEndPoint)listener.LocalEndpoint).Port;

        listener.Stop();

        return port;
    }
}
