using System.Reflection;
using PKHeX.Core;

public class SettingsDTO
{
    public static readonly string FilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "./config/pkvault.json");
    public static readonly string[] AllowedLanguages = ["en", "fr"]; //GameLanguage.AllSupportedLanguages.ToArray();

    public Guid BuildID => Assembly.GetExecutingAssembly().ManifestModule.ModuleVersionId;

    public string Version => Assembly.GetExecutingAssembly().GetName().Version?.ToString(3) ?? "";

    public string PkhexVersion => Assembly.GetAssembly(typeof(PKHeX.Core.PKM))?.GetName().Version?.ToString(3) ?? "";

    public string AppDirectory { get => MatcherUtil.NormalizePath(AppDomain.CurrentDomain.BaseDirectory); }

    public string SettingsPath { get => FilePath; }

    public bool CanUpdateSettings { get; set; }

    public bool CanScanSaves { get; set; }

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
        return SettingsMutable.LANGUAGE ?? "en";
    }

    private static string NormalizeSafePath(string path) => MatcherUtil.NormalizePath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, path));
}

public record SettingsMutableDTO(
    string DB_PATH,
    string[] SAVE_GLOBS,
    string STORAGE_PATH,
    string BACKUP_PATH,
    bool? HTTPS_NOCERT = null,
    string? HTTPS_CERT_PEM_PATH = null,
    string? HTTPS_KEY_PEM_PATH = null,
    string? LANGUAGE = null
);
