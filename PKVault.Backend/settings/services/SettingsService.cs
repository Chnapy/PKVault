using System.Text.Json;

public class SettingsService
{
    public static SettingsDTO AppSettings = GetSettings();

    public static async Task UpdateSettings(SettingsMutableDTO settingsMutable)
    {
        string text = JsonSerializer.Serialize(settingsMutable, SettingsMutableDTOJsonContext.Default.SettingsMutableDTO);
        Console.WriteLine(text);
        File.WriteAllText(SettingsDTO.filePath, text);

        AppSettings = GetSettings();

        LocalSaveService.ReadLocalSaves();

        await StorageService.ResetDataLoader(true);
    }

    private static SettingsDTO GetSettings()
    {
        if (!File.Exists(SettingsDTO.filePath))
        {
            Console.WriteLine($"Config file not existing: creating {SettingsDTO.filePath}");
            string defaultJson = JsonSerializer.Serialize(GetDefaultSettingsMutable(), SettingsMutableDTOJsonContext.Default.SettingsMutableDTO);

            string? directory = Path.GetDirectoryName(SettingsDTO.filePath);
            if (!string.IsNullOrEmpty(directory))
            {
                Directory.CreateDirectory(directory);
            }

            File.WriteAllText(SettingsDTO.filePath, defaultJson);
        }

        string json = File.ReadAllText(SettingsDTO.filePath);
        var mutableDto = JsonSerializer.Deserialize(json, SettingsMutableDTOJsonContext.Default.SettingsMutableDTO)!;
        return new()
        {
            SettingsMutable = mutableDto,
        };
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
