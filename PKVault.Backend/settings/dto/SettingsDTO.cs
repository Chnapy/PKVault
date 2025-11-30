using System.Reflection;
using PKHeX.Core;

public class SettingsDTO
{
    public static readonly string FilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "./config/pkvault.json");

    public static readonly string[] AllowedLanguages = ["en", "fr"]; //GameLanguage.AllSupportedLanguages.ToArray();

    public Guid BuildID { get => Assembly.GetExecutingAssembly().ManifestModule.ModuleVersionId; }

    public string Version => Assembly.GetExecutingAssembly().GetName().Version?.ToString(3) ?? "";

    public string AppDirectory { get => MatcherUtil.NormalizePath(AppDomain.CurrentDomain.BaseDirectory); }

    public string SettingsPath { get => FilePath; }

    public bool CanUpdateSettings { get => StorageService.HasEmptyActionList(); }

    public bool CanScanSaves { get => StorageService.HasEmptyActionList(); }

    public bool CanDeleteSaves { get => StorageService.HasEmptyActionList(); }

    public required SettingsMutableDTO SettingsMutable { get; set; }

    public string GetStoragePath() => NormalizeSafePath(SettingsMutable.STORAGE_PATH);
    public string? GetHttpsCertPemPathPath() => string.IsNullOrEmpty(SettingsMutable.HTTPS_CERT_PEM_PATH) ? null : NormalizeSafePath(SettingsMutable.HTTPS_CERT_PEM_PATH);
    public string? GetHttpsKeyPemPathPath() => string.IsNullOrEmpty(SettingsMutable.HTTPS_KEY_PEM_PATH) ? null : NormalizeSafePath(SettingsMutable.HTTPS_KEY_PEM_PATH);

    public LanguageID GetSafeLanguageID()
    {
        return GameLanguage.GetLanguage(GetSafeLanguage());
    }

    public string GetSafeLanguage()
    {
        return SettingsMutable.LANGUAGE
            ?? throw new InvalidOperationException($"Language not defined");
    }

    private static string NormalizeSafePath(string path) => MatcherUtil.NormalizePath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, path));
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
