using System.Text.Json;

public class SettingsService
{
    public static readonly AppSettings AppSettings = GetAppSettings();

    private static AppSettings GetAppSettings()
    {
        var filePath = "./config/pkvault.json";

        if (!File.Exists(filePath))
        {
            Console.WriteLine($"Config file not existing: creating {filePath}");
            string defaultJson = JsonSerializer.Serialize(GetDefaultSettings(), new JsonSerializerOptions
            {
                WriteIndented = true
            });

            string? directory = Path.GetDirectoryName(filePath);
            if (!string.IsNullOrEmpty(directory))
            {
                Directory.CreateDirectory(directory);
            }

            File.WriteAllText(filePath, defaultJson);
        }

        string json = File.ReadAllText(filePath);
        return JsonSerializer.Deserialize<AppSettings>(json);
    }

    private static AppSettings GetDefaultSettings()
    {
        AppSettings settings;

#if DEBUG
        settings = new()
        {
            DB_PATH = "./tmp/db",
            SAVE_GLOBS = ["./tmp/saves/**/*.sav", "./tmp/saves/**/*.srm", "./tmp/saves/**/*.gci", "./tmp/saves/**/*.dsv"],
            STORAGE_PATH = "./tmp/storage",
            BACKUP_PATH = "./tmp/backup",
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

public struct AppSettings
{
    public required string DB_PATH { get; set; }
    public required string[] SAVE_GLOBS { get; set; }
    public required string STORAGE_PATH { get; set; }
    public required string BACKUP_PATH { get; set; }
    public bool? HTTPS_NOCERT { get; set; }
    public string? HTTPS_CERT_PEM_PATH { get; set; }
    public string? HTTPS_KEY_PEM_PATH { get; set; }
}
