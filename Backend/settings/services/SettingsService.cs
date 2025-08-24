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
            string defaultJson = JsonSerializer.Serialize(GetDefaultSettings());

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
        return new()
        {
            DB_PATH = "./tmp/db",
            SAVE_GLOBS = ["./tmp/saves/**/*.sav"],
            STORAGE_PATH = "./tmp/storage",
            BACKUP_PATH = "./tmp/backup",
            HTTPS_CERT_PEM_PATH = "../.devcontainer/.cert/code.lan+3.pem",  // TODO should be removed
            HTTPS_KEY_PEM_PATH = "../.devcontainer/.cert/code.lan+3-key.pem",
        };
    }
}

public struct AppSettings
{
    public required string DB_PATH { get; set; }
    public required string[] SAVE_GLOBS { get; set; }
    public required string STORAGE_PATH { get; set; }
    public required string BACKUP_PATH { get; set; }
    public required string HTTPS_CERT_PEM_PATH { get; set; }
    public required string HTTPS_KEY_PEM_PATH { get; set; }
}
