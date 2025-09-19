using PKHeX.Core;

public class SettingsDTO
{
    public const string filePath = "./config/pkvault.json";

    public static readonly string[] AllowedLanguages = GameLanguage.AllSupportedLanguages.ToArray();

    public string SettingsPath { get => filePath; }

    public bool CanUpdateSettings { get => StorageService.HasEmptyActionList(); }

    public bool CanScanSaves { get => StorageService.HasEmptyActionList(); }

    public required SettingsMutableDTO SettingsMutable { get; set; }

    public LanguageID GetSafeLanguageID()
    {
        return GameLanguage.GetLanguage(GetSafeLanguage());
    }

    public string GetSafeLanguage()
    {
        return SettingsMutable.LANGUAGE
            ?? throw new Exception($"Language not defined");
    }
}

public class SettingsMutableDTO
{
    public required string DB_PATH { get; set; }

    public required string[] SAVE_GLOBS { get; set; }

    public required string STORAGE_PATH { get; set; }

    public required string BACKUP_PATH { get; set; }

    public bool? HTTPS_NOCERT { get; set; }

    public string? HTTPS_CERT_PEM_PATH { get; set; }

    public string? HTTPS_KEY_PEM_PATH { get; set; }

    public string? LANGUAGE { get; set; }
}
