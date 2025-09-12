using System.Text.Json.Serialization;

public class SettingsDTO
{
    public const string filePath = "./config/pkvault.json";

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
    public string? SETTINGS_PATH { get; set; } = default;

    public required string DB_PATH { get; set; }

    public required string[] SAVE_GLOBS { get; set; }

    public required string STORAGE_PATH { get; set; }

    public required string BACKUP_PATH { get; set; }

    public bool? HTTPS_NOCERT { get; set; }

    public string? HTTPS_CERT_PEM_PATH { get; set; }

    public string? HTTPS_KEY_PEM_PATH { get; set; }
}
