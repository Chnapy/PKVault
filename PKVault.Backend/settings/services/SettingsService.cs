using System.Reflection;

public interface ISettingsService
{
    public Task UpdateSettings(SettingsMutableDTO settingsMutable);
    public SettingsDTO GetSettings();
}

/**
 * App settings read, create and update.
 */
public class SettingsService(IServiceProvider sp) : ISettingsService
{
    public static readonly string FilePath = MatcherUtil.NormalizePath(Path.Combine(GetAppDirectory(), "./config/pkvault.json"));
    public static readonly string DefaultLanguage = "en";
    public static readonly string[] AllowedLanguages = [DefaultLanguage, "fr"]; //GameLanguage.AllSupportedLanguages.ToArray();

    private IFileIOService fileIOService => sp.GetRequiredService<IFileIOService>();
    private ISaveService saveService => sp.GetRequiredService<ISaveService>();
    private ISessionService sessionService => sp.GetRequiredService<ISessionService>();

    private SettingsDTO? BaseSettings;

    public async Task UpdateSettings(SettingsMutableDTO settingsMutable)
    {
        var sessionService = sp.GetRequiredService<ISessionService>();

        await fileIOService.WriteJSONFile(
            FilePath,
            SettingsMutableDTOJsonContext.Default.SettingsMutableDTO,
            settingsMutable
        );

        BaseSettings = ReadBaseSettings();

        saveService.InvalidateSaves();
        await sessionService.StartNewSession(checkInitialActions: true);
    }

    // Full settings
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
        // PKVault.AppImage
        var appImagePath = Environment.GetEnvironmentVariable("APPIMAGE");
        if (appImagePath != null)
        {
            var appImageDirectory = Path.GetDirectoryName(appImagePath);
            return appImageDirectory ?? appImagePath;
        }

        var exePath = System.Diagnostics.Process.GetCurrentProcess().MainModule?.FileName;
        var exeDirectory = exePath != null ? Path.GetDirectoryName(exePath) : null;

        return exeDirectory
            ?? AppDomain.CurrentDomain.BaseDirectory;
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
            STORAGE_PATH: "./tmp/storage",
            BACKUP_PATH: "./tmp/backup",
            HTTPS_NOCERT: false
        );
#else
        settings = new(
            DB_PATH: "./db",
            SAVE_GLOBS: [],
            STORAGE_PATH: "./storage",
            BACKUP_PATH: "./backup"
        );
#endif

        return settings;
    }
}
