using PKHeX.Core;

public record SettingsDTO(
    Guid BuildID,
    string Version,
    string PkhexVersion,
    string AppDirectory,
    string SettingsPath,
    bool CanUpdateSettings,
    bool CanScanSaves,
SettingsMutableDTO SettingsMutable
)
{
    public string GetStoragePath() => NormalizeSafePath(SettingsMutable.STORAGE_PATH);
    public string GetDbPath() => NormalizeSafePath(SettingsMutable.DB_PATH);
    public string GetBackupPath() => NormalizeSafePath(SettingsMutable.BACKUP_PATH);

    public string? GetHttpsCertPemPathPath() => string.IsNullOrEmpty(SettingsMutable.HTTPS_CERT_PEM_PATH) ? null : NormalizeSafePath(SettingsMutable.HTTPS_CERT_PEM_PATH);
    public string? GetHttpsKeyPemPathPath() => string.IsNullOrEmpty(SettingsMutable.HTTPS_KEY_PEM_PATH) ? null : NormalizeSafePath(SettingsMutable.HTTPS_KEY_PEM_PATH);

    public LanguageID GetSafeLanguageID()
    {
        return GameLanguage.GetLanguage(GetSafeLanguage());
    }

    public string GetSafeLanguage()
    {
        return SettingsMutable.LANGUAGE ?? SettingsService.DefaultLanguage;
    }

    private static string NormalizeSafePath(string path) => MatcherUtil.NormalizePath(Path.Combine(SettingsService.GetAppDirectory(), path));
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
