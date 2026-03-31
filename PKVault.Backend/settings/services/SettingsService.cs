using System.Reflection;
using System.Runtime.InteropServices;
using Microsoft.Extensions.Primitives;

public interface ISettingsService
{
    public Task<DataUpdateFlags?> UpdateSettings(SettingsMutableDTO settingsMutable);
    public Task<SettingsDTO> GetSettingsWithUserId();
    public SettingsDTO GetSettings();
}

/**
 * App settings read, create and update.
 */
public class SettingsService(IServiceProvider sp) : ISettingsService
{
    public static readonly string FilePath = MatcherUtil.NormalizePath(Path.Combine(GetAppDirectory(), "./config/pkvault.json"));
    public static readonly string DefaultLanguage = "en";
    public static readonly string[] AllowedLanguages = [DefaultLanguage, "fr", "de"]; //GameLanguage.AllSupportedLanguages.ToArray();
    private static readonly SemaphoreSlim semaphore = new(1);

    private IFileIOService fileIOService => sp.GetRequiredService<IFileIOService>();
    private ISavesLoadersService savesLoadersService => sp.GetRequiredService<ISavesLoadersService>();
    private ISessionService sessionService => sp.GetRequiredService<ISessionService>();

    private SettingsDTO? BaseSettings;

    public async Task<DataUpdateFlags?> UpdateSettings(SettingsMutableDTO settingsMutable)
    {
        await fileIOService.WriteJSONFile(
            FilePath,
            SettingsMutableDTOJsonContext.Default.SettingsMutableDTO,
            settingsMutable
        );

        using var scope = sp.CreateScope();

        var userId = await scope.ServiceProvider.GetRequiredService<IMetaLoader>().GetUserId();

        BaseSettings = ReadBaseSettings() with
        {
            UserId = userId
        };

        savesLoadersService.Clear();

        var flags = await sessionService.StartNewSession(checkInitialActions: true);

        if (!sessionService.HasEmptyActionList())
        {
            await sessionService.PersistSession(scope);
            await sessionService.StartNewSession(checkInitialActions: false);
        }

        return flags;
    }

    public async Task<SettingsDTO> GetSettingsWithUserId()
    {
        await semaphore.WaitAsync();
        try
        {
            var scope = sp.CreateScope();

            // DB use is required to avoid rare first-run app crash after language selection
            // trigger DB creation, migration etc
            var userId = await scope.ServiceProvider.GetRequiredService<IMetaLoader>().GetUserId();

            BaseSettings = GetSettings() with
            {
                UserId = userId
            };
        }
        finally
        {
            semaphore.Release();
        }

        return BaseSettings;
    }

    public SettingsDTO GetSettings()
    {
        if (BaseSettings == null)
        {
            BaseSettings = ReadBaseSettings();
        }

        return BaseSettings with
        {
            CanUpdateSettings = sessionService.HasEmptyActionList(),
            CanScanSaves = sessionService.HasEmptyActionList()
        };
    }

    public static string GetAppDirectory()
    {
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
        {
            return Path.GetFullPath(
                // expected in Docker monolith context
                Environment.GetEnvironmentVariable("PKVAULT_PATH")
                // expected in flatpak context
                ?? Environment.GetEnvironmentVariable("XDG_DATA_HOME")
                // expected in all other linux contexts
                ?? Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments)
                    ?? "~/",
                    "pkvault"
                )
            );
        }

        var exePath = System.Diagnostics.Process.GetCurrentProcess().MainModule?.FileName;
        var exeDirectory = exePath != null ? Path.GetDirectoryName(exePath) : null;

        return Path.GetFullPath(exeDirectory
            ?? AppDomain.CurrentDomain.BaseDirectory);
    }

    public static (Guid BuildID, string Version) GetBuildInfo()
    {
        var assembly = Assembly.GetExecutingAssembly();
        return (
            BuildID: assembly.ManifestModule.ModuleVersionId,
            Version: assembly.GetName().Version?.ToString(3) ?? ""
        );
    }

    private SettingsDTO ReadBaseSettings()
    {
        var mutableDto = fileIOService.ReadJSONFileSync(
            FilePath,
            SettingsMutableDTOJsonContext.Default.SettingsMutableDTO,
            GetDefaultSettingsMutable()
        );

        var (BuildID, Version) = GetBuildInfo();

        return new(
            BuildID,
            Version,
            PkhexVersion: Assembly.GetAssembly(typeof(PKHeX.Core.PKM))?.GetName().Version?.ToString(3) ?? "",
            AppDirectory: MatcherUtil.NormalizePath(GetAppDirectory()),
            SettingsPath: FilePath,
            UserId: "", // should be defined later
            CanUpdateSettings: false,
            CanScanSaves: false,
            SettingsMutable: mutableDto
        );
    }

    private static SettingsMutableDTO GetDefaultSettingsMutable()
    {
        SettingsMutableDTO settings;

#if DEBUG
        settings = new(
            DB_PATH: "./tmp/db",
            SAVE_GLOBS: [],
            PKM_EXTERNAL_GLOBS: [],
            STORAGE_PATH: "./tmp/storage",
            BACKUP_PATH: "./tmp/backup",
            HIDE_CHEATS: false,
            HTTPS_NOCERT: false
        );
#else
        settings = new(
            DB_PATH: "./db",
            SAVE_GLOBS: [],
            PKM_EXTERNAL_GLOBS: [],
            STORAGE_PATH: "./storage",
            BACKUP_PATH: "./backup",
            HIDE_CHEATS: false
        );
#endif

        return settings;
    }
}
