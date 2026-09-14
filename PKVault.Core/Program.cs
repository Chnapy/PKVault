using System.IO.Abstractions;
using System.Runtime.InteropServices;
using Microsoft.Extensions.DependencyInjection;
using PKVault.Core.backup.routes;
using PKVault.Core.dex.routes;
using PKVault.Core.saveinfos.routes;
using PKVault.Core.settings.routes;
using PKVault.Core.storage.routes;
using PKVault.Core.warnings.routes;
using Serilog;

namespace PKVault.Core;

public class Program
{
    public static readonly string InitialCurrentDirectory = Directory.GetCurrentDirectory();
    private static bool Initialized = false;

    public static void Initialize(LoggerConfiguration? config = null)
    {
        var currentDirectoryFixed = false;

        // Should be done BEFORE initialize
        // otherwise some tests may fail (because of concurrency run ?)
        if (!FileIOService.IsScriptsContext
            && Directory.GetCurrentDirectory() == InitialCurrentDirectory)
        {
            // case in tests only
            if (!Directory.Exists(SettingsService.AppDirectory))
                Directory.CreateDirectory(SettingsService.AppDirectory);

            // Ensure behavior consistency between backend & desktop
            // Required to ensure photino directory wwwroot being created in app directory
            // since app directory can be different than executable one (flatpak ran by steam)
            Directory.SetCurrentDirectory(SettingsService.AppDirectory);
            currentDirectoryFixed = true;
        }

        if (Initialized)
            return;
        Initialized = true;

        LogUtil.Initialize(config);

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

        if (currentDirectoryFixed)
            Log.Logger.Debug($"Current directory (fixed) : {Directory.GetCurrentDirectory()}");

        var (BuildID, Version) = SettingsService.GetBuildInfo();
        Log.Information("PKVault Copyright (C) 2026  Richard Haddad"
        + "\nThis program comes with ABSOLUTELY NO WARRANTY."
        + "\nThis is free software, and you are welcome to redistribute it under certain conditions."
        + "\nFull license can be accessed here: https://github.com/Chnapy/PKVault/blob/main/LICENSE"
        + $"\nPKVault v{Version} BuildID = {BuildID}"
        + $"\nCurrent time UTC = {DateTime.UtcNow}\n");
    }

    public static void ConfigureServices(IServiceCollection services)
    {
        ConfigureMinimalServices(services);

        Log.Information($"Setup services - DB");
        services.AddDbContext<SessionDbContext>();

        services.AddSingleton<ISessionService, SessionService>();
        services.AddSingleton<ISessionServiceMinimal, ISessionService>(sp => sp.GetRequiredService<ISessionService>());   // use same instance as ISessionService
        services.AddSingleton<IDbSeedingService, DbSeedingService>();

        Log.Information($"Setup services - Main");
        services.AddSingleton<StaticDataService>();
        services.AddSingleton<StorageQueryService>();
        services.AddSingleton<ActionService>();
        services.AddSingleton<DexService>();
        services.AddSingleton<DexDataService>();
        services.AddSingleton<WarningsService>();
        services.AddSingleton<BackupService>();
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

        Log.Information($"Setup services - Routing");
        // services.AddLogging();
        // services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblyContaining<Program>());
        services.AddSingleton<CoreRouter>();
        services.AddScoped<BackupController>();
        services.AddScoped<SaveInfosController>();
        services.AddScoped<StorageController>();
        services.AddScoped<DexController>();
        services.AddScoped<SettingsController>();
        services.AddScoped<WarningsController>();
        services.AddScoped<StaticDataController>();

        Log.Information($"Setup services - Finished");
    }

    public static void ConfigureMinimalServices(IServiceCollection services)
    {
        Log.Information($"Setup services - Minimal");
        services.AddSingleton(TimeProvider.System);
        services.AddSingleton<IFileSystem>(new FileSystem());
        services.AddSingleton<IFileIOService, FileIOService>();
        services.AddSingleton<ISettingsService, SettingsService>();
    }

    public static void Dispose()
    {
        LogUtil.Dispose();
    }

    public static async Task SetupData(IServiceProvider sp)
    {
        await SetupSampleSaveFile(sp);

        // var sessionService = sp.GetRequiredService<ISessionServiceMinimal>();
        // await sessionService.EnsureSessionCreated();
    }

    private static async Task SetupSampleSaveFile(IServiceProvider sp)
    {
        var settingsService = sp.GetRequiredService<ISettingsService>();
        var fileSystem = sp.GetRequiredService<IFileSystem>();

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
    }

    public static bool HasEmptyActionList(IServiceProvider sp)
    {
        return sp.GetRequiredService<ISessionService>().HasEmptyActionList();
    }
}
