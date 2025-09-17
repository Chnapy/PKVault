using System.Text.Json;

public class SettingsService
{
    private static readonly JsonSerializerOptions jsonOptions = new()
    {
        WriteIndented = true
    };
    public static SettingsDTO AppSettings = GetSettings();

    public static async Task UpdateSettings(SettingsMutableDTO settingsMutable)
    {
        var text = JsonSerializer.Serialize(settingsMutable, jsonOptions);
        Console.WriteLine(text);
        File.WriteAllText(SettingsDTO.filePath, text);

        AppSettings = GetSettings();

        await LocalSaveService.ReadLocalSaves();

        await StorageService.ResetDataLoader();

        await WarningsService.CheckWarnings();
    }

    private static SettingsDTO GetSettings()
    {
        if (!File.Exists(SettingsDTO.filePath))
        {
            Console.WriteLine($"Config file not existing: creating {SettingsDTO.filePath}");
            string defaultJson = JsonSerializer.Serialize(GetDefaultSettingsMutable(), jsonOptions);

            string? directory = Path.GetDirectoryName(SettingsDTO.filePath);
            if (!string.IsNullOrEmpty(directory))
            {
                Directory.CreateDirectory(directory);
            }

            File.WriteAllText(SettingsDTO.filePath, defaultJson);
        }

        string json = File.ReadAllText(SettingsDTO.filePath);
        var mutableDto = JsonSerializer.Deserialize<SettingsMutableDTO>(json)!;
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
            SAVE_GLOBS = ["./tmp/saves/**/*.sav", "./tmp/saves/**/*.srm", "./tmp/saves/**/*.gci", "./tmp/saves/**/*.dsv"],
            STORAGE_PATH = "./tmp/storage",
            BACKUP_PATH = "./tmp/backup",
            HTTPS_NOCERT = true,
        };
#else
        settings = new()
        {
            DB_PATH = "./db",
            SAVE_GLOBS = [
                "./saves/**/*.sav",
                "./saves/**/*.srm",
                "./saves/**/*.gci",
                "./saves/**/*.dsv"
            ],
            STORAGE_PATH = "./storage",
            BACKUP_PATH = "./backup",
        };
#endif

        return settings;
    }
}
