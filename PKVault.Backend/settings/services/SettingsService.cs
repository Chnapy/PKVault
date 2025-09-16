using System.Text.Json;

public class SettingsService
{
    private static readonly JsonSerializerOptions jsonOptions = new()
    {
        WriteIndented = true
    };
    public static SettingsDTO AppSettings = GetSettings();

    public static async Task UpdateSettings(SettingsDTO settings)
    {
        settings.SETTINGS_PATH = default;
        var text = JsonSerializer.Serialize(settings, jsonOptions);
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
            string defaultJson = JsonSerializer.Serialize(GetDefaultSettings(), jsonOptions);

            string? directory = Path.GetDirectoryName(SettingsDTO.filePath);
            if (!string.IsNullOrEmpty(directory))
            {
                Directory.CreateDirectory(directory);
            }

            File.WriteAllText(SettingsDTO.filePath, defaultJson);
        }

        string json = File.ReadAllText(SettingsDTO.filePath);
        var dto = JsonSerializer.Deserialize<SettingsDTO>(json)!;
        dto.SETTINGS_PATH = SettingsDTO.filePath;
        return dto;
    }

    private static SettingsDTO GetDefaultSettings()
    {
        SettingsDTO settings;

#if DEBUG
        settings = new()
        {
            SETTINGS_PATH = SettingsDTO.filePath,
            DB_PATH = "./tmp/db",
            SAVE_GLOBS = ["./tmp/saves/**/*.sav", "./tmp/saves/**/*.srm", "./tmp/saves/**/*.gci", "./tmp/saves/**/*.dsv"],
            STORAGE_PATH = "./tmp/storage",
            BACKUP_PATH = "./tmp/backup",
            HTTPS_NOCERT = true,
        };
#else
        settings = new()
        {
            SETTINGS_PATH = SettingsDTO.filePath,
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
