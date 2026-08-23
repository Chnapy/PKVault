using System.IO.Abstractions;
using System.IO.Compression;
using System.Net;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Security.Cryptography.X509Certificates;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.AspNetCore.ResponseCompression;
using Serilog;

namespace PKVault.Backend;

public class Program
{
    // For migration file generation
    // EF Core uses this method at design time to access the DbContext
    public static IHostBuilder CreateHostBuilder(string[] args)
        => Host.CreateDefaultBuilder(args)
            .ConfigureWebHostDefaults(
                webBuilder => webBuilder.UseStartup<Startup>());

    private static readonly string InitialCurrentDirectory = Directory.GetCurrentDirectory();

    public static async Task Main(string[] args)
    {
        LogUtil.Initialize();

        Log.Logger.Debug($"ARGS: {string.Join(' ', args)}");

        // SettingsService.ProgramArgs = args;

        // "Microsoft Windows 10.0.123"
        // "GNOME 50 (Flatpak runtime)"
        // "Linux Mint 22.1"
        Log.Logger.Debug($"OS : {RuntimeInformation.OSDescription}");
        Log.Logger.Debug($"OS LANGUAGE : {System.Globalization.CultureInfo.CurrentUICulture.Name}");

        // "win-x64"
        // "linux-x64"
        // "linux-arm64"
        Log.Logger.Debug($"RID runtime : {RuntimeInformation.RuntimeIdentifier}");

        Log.Logger.Debug($"Current directory : {InitialCurrentDirectory}");

        // SettingsService.ProgramArgs = args;

#if MODE_DEFAULT
        // Ensure behavior consistency between backend & desktop
        Directory.SetCurrentDirectory(SettingsService.GetAppDirectory());
#endif

        Log.Logger.Debug($"Current directory (fixed) : {Directory.GetCurrentDirectory()}");

        try
        {
            Copyright();

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
            LogUtil.Dispose();
        }
    }

    public static void Copyright()
    {
        var (BuildID, Version) = SettingsService.GetBuildInfo();
        Log.Information("PKVault Copyright (C) 2026  Richard Haddad"
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

        Log.Information($"Memory checks: initial={initialMemoryUsedMB} MB setuped={setupedMemoryUsedMB} MB diff={setupedMemoryUsedMB - initialMemoryUsedMB} MB");

        // if (args.Length > 0 && args[0] == "clean")
        // {
        //     await host.Services.GetRequiredService<MaintenanceService>().CleanMainStorageFiles();
        //     return null;
        // }

        // if (args.Length > 0 && args[0] == "test-bkp")
        // {
        //     await host.Services.GetRequiredService<BackupService>().CreateBackup();
        //     return null;
        // }

        var settingsService = host.Services.GetRequiredService<ISettingsService>();
        var fileSystem = host.Services.GetRequiredService<IFileSystem>();

        var saveGlobs = settingsService.GetSettings().SettingsMutable.SAVE_GLOBS;

        var defaultSavePath = FileIOService.NormalizePath(SettingsService.DefaultSavePath);

        if (saveGlobs.Contains(SettingsService.DefaultSavePath) && !fileSystem.File.Exists(defaultSavePath))
        {
            using var _ = Log.Logger.Time($"Default save file in save globs and is missing. Writing file to {SettingsService.DefaultSavePath}");

            var assembly = new AssemblyClient();
            using var defaultSaveStream = await assembly.GetAsync([
                "default_files",
                "pokemon_emerald_sample.sav",
            ]);
            using var fileStream = fileSystem.File.Create(defaultSavePath);
            defaultSaveStream.CopyTo(fileStream);
        }

        return async () =>
        {
#if DEBUG && MODE_DEFAULT

            var swaggerPath = MatcherUtil.NormalizePath(Path.Combine(InitialCurrentDirectory, "swagger.json"));
            Log.Logger.Debug($"Generate Swagger file to {swaggerPath}");

            try
            {
                var swaggerHref = $"http://localhost:5000/swagger/v1/swagger.json";
                using HttpClient http = new();
                using var response = await http.GetAsync(swaggerHref);
                var json = await response.Content.ReadAsStringAsync();

                var oldJson = await File.ReadAllTextAsync(swaggerPath);

                if (json != oldJson)
                {
                    Log.Logger.Debug($"Swagger content changed.");
                    await File.WriteAllTextAsync(swaggerPath, json);
                    Log.Logger.Debug($"Swagger file generated: {swaggerPath}");
                }
                else
                {
                    Log.Logger.Debug($"Swagger didn't change, generation aborted.");
                }
            }
            catch (Exception ex)
            {
                Log.Logger.Error(ex, $"Generate Swagger file failed.");
            }
#endif

            await host.Services.GetRequiredService<ISessionServiceMinimal>().EnsureSessionCreated();
        };
#else
        throw new Exception("Mode not defined");
#endif
    }

    public static async Task<WebApplication> PrepareWebApp(int port)
    {
        var builder = WebApplication.CreateBuilder([]);

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

        services.AddSerilog();

#if MODE_GEN_POKEAPI
        services.AddSingleton<PokeApiService>();
        services.AddSingleton<GenStaticDataService>();
#endif

        services.AddSingleton(TimeProvider.System);

        Log.Information($"Setup services - DB");
        services.AddDbContext<SessionDbContext>();

        services.AddSingleton<ISessionService, SessionService>();
        services.AddSingleton<ISessionServiceMinimal, ISessionService>(sp => sp.GetRequiredService<ISessionService>());   // use same instance as ISessionService
        services.AddSingleton<IDbSeedingService, DbSeedingService>();

        Log.Information($"Setup services - Main");
        services.AddSingleton<IFileSystem>(new FileSystem());
        services.AddSingleton<IFileIOService, FileIOService>();
        services.AddSingleton<StaticDataService>();
        services.AddSingleton<StorageQueryService>();
        services.AddSingleton<ActionService>();
        // services.AddSingleton<MaintenanceService>();
        services.AddSingleton<DexService>();
        services.AddSingleton<DexDataService>();
        services.AddSingleton<WarningsService>();
        services.AddSingleton<BackupService>();
        services.AddSingleton<ISettingsService, SettingsService>();
        services.AddSingleton<ILegalityAnalysisService, LegalityAnalysisService>();
        services.AddSingleton<DataService>();
        services.AddSingleton<IPkmConvertService, PkmConvertService>();
        services.AddSingleton<IPkmSharePropertiesService, PkmSharePropertiesService>();
        services.AddSingleton<PkmUpdateService>();
        services.AddSingleton<PkmLegalityService>();

        Log.Information($"Setup services - Actions");
        services.AddScoped<DataNormalizeAction>();
        services.AddScoped<UpdateExternalPkmAction>();
        services.AddScoped<SynchronizePkmAction>();
        services.AddScoped<MainCreateBoxAction>();
        services.AddScoped<MainUpdateBoxAction>();
        services.AddScoped<MainDeleteBoxAction>();
        services.AddScoped<MainCreateBankAction>();
        services.AddScoped<MainUpdateBankAction>();
        services.AddScoped<MainDeleteBankAction>();
        services.AddScoped<MovePkmAction>();
        services.AddScoped<MovePkmBankAction>();
        services.AddScoped<MainCreatePkmVariantAction>();
        services.AddScoped<EditPkmVariantAction>();
        services.AddScoped<EditPkmSaveAction>();
        services.AddScoped<DetachPkmSaveAction>();
        services.AddScoped<DeletePkmVariantAction>();
        services.AddScoped<SaveDeletePkmAction>();
        services.AddScoped<EvolvePkmAction>();
        services.AddScoped<SortPkmAction>();
        services.AddScoped<DexSyncAction>();

        Log.Information($"Setup services - Loaders");
        services.AddScoped<IMetaLoader, MetaLoader>();
        services.AddScoped<IBankLoader, BankLoader>();
        services.AddScoped<IBoxLoader, BoxLoader>();
        services.AddScoped<IPkmVariantLoader, PkmVariantLoader>();
        services.AddScoped<IPkmFileLoader, PkmFileLoader>();
        services.AddScoped<IDexLoader, DexLoader>();
        services.AddSingleton<ISavesLoadersService, SavesLoadersService>();   // singleton for perf reasons

#if DEBUG && MODE_DEFAULT
        services.AddEndpointsApiExplorer();
        services.AddOpenApiDocument(document =>
        {
            document.RequireParametersWithoutDefault = true;
            document.SchemaSettings.DefaultReferenceTypeNullHandling = NJsonSchema.Generation.ReferenceTypeNullHandling.NotNull;

            document.SchemaSettings.SchemaProcessors.Add(new AutoRequiredSchemaProcessor());
            // Required for PKHeX.Core.Gender which has duplicates
            document.SchemaSettings.SchemaProcessors.Add(new EnumDuplicatesSchemaProcessor());
            document.PostProcess = doc =>
            {
                doc.Info.Title = "PKVault API";
            };
        });
#endif

        Log.Information($"Setup services - Finished");
    }

    public static void ConfigureAppBuilder(IApplicationBuilder app, bool useHttps)
    {
        app.UseRateLimiter();

        app.UseSerilogRequestLogging();

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

    public static bool HasEmptyActionList(IHost host)
    {
        return host.Services.GetRequiredService<ISessionService>().HasEmptyActionList();
    }
}
