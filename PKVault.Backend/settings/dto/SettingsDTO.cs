using PKHeX.Core;

public record SettingsDTO(
    Guid BuildID,
    RuntimeSystem RuntimeSystem,
    SourceProvider SourceProvider,
    bool FlatpakMigrated,
    string Version,
    string PkhexVersion,
    string AppDirectory,
    string SettingsPath,
    string UserId,
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
        return GameLanguage.GetLanguage(GetLanguageForPKHeX());
    }

    public string GetLanguageOrDefault()
    {
        return SettingsMutable.LANGUAGE ?? SettingsService.DefaultLanguage;
    }

    public string GetLanguageForPKHeX()
    {
        return GetLanguageForPKHeX(GetLanguageOrDefault());
    }

    public static string GetLanguageForPKHeX(string lang)
    {
        var index = GameLanguage.AllSupportedLanguages.ToArray()
            .Select(lang => lang.ToLower()).ToArray()
            .IndexOf(lang);

        if (index == -1)
            return SettingsService.DefaultLanguage;

        return GameLanguage.AllSupportedLanguages[index];
    }

    private static string NormalizeSafePath(string path) => MatcherUtil.NormalizePath(Path.Combine(
        SettingsService.GetAppDirectory(),
        path
    ));
}

public record SettingsMutableDTO(
    string DB_PATH,
    string[] SAVE_GLOBS,
    string[]? PKM_EXTERNAL_GLOBS,
    string STORAGE_PATH,
    string BACKUP_PATH,
    bool HIDE_CHEATS,
    bool SKIP_LEGALITY_CHECKS,
    Dictionary<uint, GameVersion>? SAVE_VERSION_OVERRIDES = null,
    Dictionary<uint, string>? SAVE_PATH_OVERRIDES = null,
    bool? HTTPS_NOCERT = null,
    string? HTTPS_CERT_PEM_PATH = null,
    string? HTTPS_KEY_PEM_PATH = null,
    string LANGUAGE = "en"
);

public enum RuntimeSystem
{
    UNKNOWN,
    DOCKER,
    WINDOWS,
    LINUX,
    STEAMDECK,
}

public enum SourceProvider
{
    GithubRelease,
    Flathub,
}
