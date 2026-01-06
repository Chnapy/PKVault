using System.Text.Json;

public class SettingsService(LoaderService loaderService, LocalSaveService saveService)
{
    // Most of settings available as static
    public static SettingsDTO BaseSettings = ReadBaseSettings();

    public async Task UpdateSettings(SettingsMutableDTO settingsMutable)
    {
        string text = JsonSerializer.Serialize(settingsMutable, SettingsMutableDTOJsonContext.Default.SettingsMutableDTO);
        Console.WriteLine(text);

        CheckSettingsFile();
        File.WriteAllText(SettingsDTO.FilePath, text);

        BaseSettings = GetSettings();

        saveService.ReadLocalSaves();

        await loaderService.ResetDataLoader(true);
    }

    // Full settings
    public SettingsDTO GetSettings()
    {
        BaseSettings.CanUpdateSettings = loaderService.HasEmptyActionList();
        BaseSettings.CanScanSaves = loaderService.HasEmptyActionList();

        return BaseSettings;
    }

    private static SettingsDTO ReadBaseSettings()
    {
        CheckSettingsFile();

        string json = File.ReadAllText(SettingsDTO.FilePath);
        var mutableDto = JsonSerializer.Deserialize(json, SettingsMutableDTOJsonContext.Default.SettingsMutableDTO)!;
        return new()
        {
            SettingsMutable = mutableDto,
        };
    }

    private static void CheckSettingsFile()
    {
        if (!File.Exists(SettingsDTO.FilePath))
        {
            Console.WriteLine($"Config file not existing: creating {SettingsDTO.FilePath}");
            string defaultJson = JsonSerializer.Serialize(GetDefaultSettingsMutable(), SettingsMutableDTOJsonContext.Default.SettingsMutableDTO);

            string? directory = Path.GetDirectoryName(SettingsDTO.FilePath);
            if (!string.IsNullOrEmpty(directory))
            {
                Directory.CreateDirectory(directory);
            }

            File.WriteAllText(SettingsDTO.FilePath, defaultJson);
        }
    }

    private static SettingsMutableDTO GetDefaultSettingsMutable()
    {
        SettingsMutableDTO settings;

#if DEBUG
        settings = new()
        {
            DB_PATH = "./tmp/db",
            SAVE_GLOBS = [],
            STORAGE_PATH = "./tmp/storage",
            BACKUP_PATH = "./tmp/backup",
            HTTPS_NOCERT = false,
        };
#else
        settings = new()
        {
            DB_PATH = "./db",
            SAVE_GLOBS = [],
            STORAGE_PATH = "./storage",
            BACKUP_PATH = "./backup",
        };
#endif

        return settings;
    }
}
