using System.Reflection;

/**
 * App settings read, create and update.
 */
public class SettingsService(IServiceProvider sp)
{
    public static readonly string FilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "./config/pkvault.json");
    public static readonly string DefaultLanguage = "en";
    public static readonly string[] AllowedLanguages = [DefaultLanguage, "fr"]; //GameLanguage.AllSupportedLanguages.ToArray();

    private FileIOService fileIOService => sp.GetRequiredService<FileIOService>();
    private SaveService saveService => sp.GetRequiredService<SaveService>();
    private LoadersService loadersService => sp.GetRequiredService<LoadersService>();

    private SettingsDTO? BaseSettings;

    public async Task UpdateSettings(SettingsMutableDTO settingsMutable)
    {
        var text = fileIOService.WriteJSONFile(
            FilePath,
            SettingsMutableDTOJsonContext.Default.SettingsMutableDTO,
            settingsMutable
        );
        Console.WriteLine(text);

        BaseSettings = ReadBaseSettings();

        saveService.InvalidateSaves();
        loadersService.InvalidateLoaders((maintainData: true, checkSaves: true));
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
            CanUpdateSettings = loadersService.HasEmptyActionList(),
            CanScanSaves = loadersService.HasEmptyActionList()
        };
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
        var mutableDto = fileIOService.ReadJSONFile(
            FilePath,
            SettingsMutableDTOJsonContext.Default.SettingsMutableDTO,
            GetDefaultSettingsMutable()
        );

        var (BuildID, Version) = GetBuildInfo();

        return new(
            BuildID,
            Version,
            PkhexVersion: Assembly.GetAssembly(typeof(PKHeX.Core.PKM))?.GetName().Version?.ToString(3) ?? "",
            AppDirectory: MatcherUtil.NormalizePath(AppDomain.CurrentDomain.BaseDirectory),
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
