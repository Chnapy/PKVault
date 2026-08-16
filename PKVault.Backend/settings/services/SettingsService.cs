using System.Net;
using System.Reflection;
using System.Runtime.InteropServices;
using PKHeX.Core;
using Serilog;

public interface ISettingsService
{
    public Task UpdateSettings(SettingsMutableDTO settingsMutable, bool restartSession, bool persistSession, DataUpdateFlags flags);
    public Task<SettingsDTO> GetSettingsWithUserId();
    public SettingsDTO GetSettings();
    public SettingsDTO RefreshSettings(DataUpdateFlags flags);
    public (bool RestartSession, bool PersistSession) GetUpdateDiff(SettingsMutableDTO updatedSettingsMutable, DataUpdateFlags flags);
}

/**
 * App settings read, create and update.
 */
public class SettingsService(IServiceProvider sp) : ISettingsService
{
    public static readonly string FilePath = MatcherUtil.NormalizePath(Path.Combine(GetAppDirectory(), "./config/pkvault.json"));
    public static readonly string DefaultLanguage = "en";
    public static readonly string[] AllowedLanguages = [DefaultLanguage, "fr", "de", "pt-br"]; //GameLanguage.AllSupportedLanguages.ToArray();
    private static readonly SemaphoreSlim semaphore = new(1);

    // public static string[] ProgramArgs = [];
    public static bool FlatpakMigrated = false;

    private IFileIOService fileIOService => sp.GetRequiredService<IFileIOService>();
    private ISessionService sessionService => sp.GetRequiredService<ISessionService>();

    private SettingsDTO? BaseSettings;

    public async Task UpdateSettings(SettingsMutableDTO settingsMutable, bool restartSession, bool persistSession, DataUpdateFlags flags)
    {
        await fileIOService.WriteJSONFile(
            FilePath,
            SettingsMutableDTOJsonContext.Default.SettingsMutableDTO,
            settingsMutable
        );
        flags.Settings = true;

        using var scope = sp.CreateScope();

        var userId = string.IsNullOrEmpty(BaseSettings?.UserId)
            ? await scope.ServiceProvider.GetRequiredService<IMetaLoader>().GetUserId()
            : BaseSettings.UserId;

        BaseSettings = ReadBaseSettings() with
        {
            UserId = userId
        };

        if (persistSession && !sessionService.HasEmptyActionList())
        {
            await sessionService.PersistSession(scope);
            await sessionService.StartNewSession(checkInitialActions: false, flags);
        }

        if (restartSession)
        {
            await sessionService.StartNewSession(checkInitialActions: true, flags);

            if (!sessionService.HasEmptyActionList())
            {
                await sessionService.PersistSession(scope);
                await sessionService.StartNewSession(checkInitialActions: false, flags);
            }
        }
    }

    /**
     * Make a diff between current settings and updated ones.
     * Update flags following changed settings.
     * 
     * Returns if session should be restarted or persisted.
     */
    public (bool RestartSession, bool PersistSession) GetUpdateDiff(SettingsMutableDTO updatedSettingsMutable, DataUpdateFlags flags)
    {
        var currentSettingsMutable = ReadBaseSettings().SettingsMutable;

        static string GetArrayChecksum(string[]? arr) => string.Join('|', (arr ?? []).ToArray().Order());

        static string GetSaveVersionOverridesChecksum(IDictionary<uint, GameVersion>? saveVersionOverrides) => GetArrayChecksum([
            ..saveVersionOverrides?.Keys.Order().Select(k => k.ToString()) ?? [],
            ..saveVersionOverrides?.Values.Order().Select(v => ((byte)v).ToString()) ?? [],
        ]);

        bool restartSession = false;
        bool persistSession = false;

        var hasPathChanges = currentSettingsMutable.DB_PATH != updatedSettingsMutable.DB_PATH
            || currentSettingsMutable.STORAGE_PATH != updatedSettingsMutable.STORAGE_PATH
            || currentSettingsMutable.BACKUP_PATH != updatedSettingsMutable.BACKUP_PATH
            || GetArrayChecksum(currentSettingsMutable.SAVE_GLOBS) != GetArrayChecksum(updatedSettingsMutable.SAVE_GLOBS)
            || GetArrayChecksum(currentSettingsMutable.PKM_EXTERNAL_GLOBS) != GetArrayChecksum(updatedSettingsMutable.PKM_EXTERNAL_GLOBS);

        var hasFirstLanguageChange = currentSettingsMutable.LANGUAGE == null && updatedSettingsMutable.LANGUAGE != null;
        if (hasFirstLanguageChange)
        {
            persistSession = true;
        }

        if (hasPathChanges)
        {
            restartSession = true;
        }

        var hasLanguageChange = currentSettingsMutable.LANGUAGE != updatedSettingsMutable.LANGUAGE;

        if (hasLanguageChange)
        {
            flags.StaticData = true;
            flags.MainPkmVariants.All = true;
            flags.Saves.All = true;
        }

        var hasLegalityChanges = currentSettingsMutable.SKIP_LEGALITY_CHECKS != updatedSettingsMutable.SKIP_LEGALITY_CHECKS;

        if (hasLegalityChanges)
        {
            flags.MainPkmVariants.All = true;
            flags.Saves.All = true;
        }

        var hasSaveVersionOverridesChange = GetSaveVersionOverridesChecksum(currentSettingsMutable.SAVE_VERSION_OVERRIDES)
            != GetSaveVersionOverridesChecksum(updatedSettingsMutable.SAVE_VERSION_OVERRIDES);

        if (hasSaveVersionOverridesChange)
        {
            flags.SaveInfos = true;
        }

        return (restartSession, persistSession);
    }

    public async Task<SettingsDTO> GetSettingsWithUserId()
    {
        await semaphore.WaitAsync();
        try
        {
            var scope = sp.CreateScope();

            // DB use is required to avoid rare first-run app crash after language selection
            // trigger DB creation, migration etc
            var userId = await scope.ServiceProvider.GetRequiredService<IMetaLoader>().GetUserId();

            BaseSettings = GetSettings() with
            {
                UserId = userId
            };
        }
        finally
        {
            semaphore.Release();
        }

        return BaseSettings;
    }

    public SettingsDTO GetSettings()
    {
        if (BaseSettings == null)
        {
            return RefreshSettings();
        }

        return BaseSettings with
        {
            CanUpdateSettings = sessionService.HasEmptyActionList(),
            CanScanSaves = sessionService.HasEmptyActionList()
        };
    }

    public SettingsDTO RefreshSettings(DataUpdateFlags? flags = null)
    {
        BaseSettings = ReadBaseSettings(flags);

        return BaseSettings with
        {
            CanUpdateSettings = sessionService.HasEmptyActionList(),
            CanScanSaves = sessionService.HasEmptyActionList()
        };
    }

    public static string GetAppDirectory()
    {
        if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
        {
            return Path.GetFullPath(
                // expected in Docker monolith context
                EnvUtil.PKVAULT_PATH
                // expected in flatpak context
                ?? EnvUtil.XDG_DATA_HOME
                // expected in all other linux contexts
                ?? Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments)
                    ?? "~/",
                    "pkvault"
                )
            );
        }

        var exePath = System.Diagnostics.Process.GetCurrentProcess().MainModule?.FileName;
        var exeDirectory = exePath != null ? Path.GetDirectoryName(exePath) : null;

        return Path.GetFullPath(exeDirectory
            ?? AppDomain.CurrentDomain.BaseDirectory);
    }

    public static (Guid BuildID, string Version) GetBuildInfo()
    {
        var assembly = Assembly.GetExecutingAssembly();
        return (
            BuildID: assembly.ManifestModule.ModuleVersionId,
            Version: assembly.GetName().Version?.ToString(3) ?? ""
        );
    }

    private SettingsDTO ReadBaseSettings(DataUpdateFlags? flags = null)
    {
        var mutableDto = fileIOService.ReadJSONFileSync(
            FilePath,
            SettingsMutableDTOJsonContext.Default.SettingsMutableDTO,
            GetDefaultSettingsMutable()
        );

        flags?.Settings = true;

        var (BuildID, Version) = GetBuildInfo();

        return new(
            BuildID,
            RuntimeSystem: GetRuntimeSystem(),
            SourceProvider: GetSourceProvider(),
            FlatpakMigrated: FlatpakMigrated,
            Version,
            PkhexVersion: Assembly.GetAssembly(typeof(PKHeX.Core.PKM))?.GetName().Version?.ToString(3) ?? "",
            AppDirectory: MatcherUtil.NormalizePath(GetAppDirectory()),
            SettingsPath: FilePath,
            UserId: "", // should be defined later
            CanUpdateSettings: false,
            CanScanSaves: false,
            SettingsMutable: mutableDto
        );
    }

    private static RuntimeSystem GetRuntimeSystem()
    {
        if (!string.IsNullOrEmpty(EnvUtil.PKVAULT_PATH))
            return RuntimeSystem.DOCKER;

        if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            return RuntimeSystem.WINDOWS;

        if (!RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
            return RuntimeSystem.UNKNOWN;

        static bool IsSteamDeck()
        {
            try
            {
                var osReleasePath = "/etc/os-release";
                if (!File.Exists(osReleasePath))
                {
                    // fallback
                    osReleasePath = "/usr/lib/os-release";
                    if (!File.Exists(osReleasePath))
                        return false;
                }

                foreach (var line in File.ReadLines(osReleasePath))
                {
                    if (line.StartsWith("ID="))
                    {
                        var id = line.Split('=')[1].Trim('"');
                        if (id == "steamos")
                            return true;
                    }

                    if (line.StartsWith("NAME="))
                    {
                        var name = line.Split('=')[1].Trim('"');
                        if (name == "SteamOS")
                            return true;
                    }

                    if (line.StartsWith("VERSION_ID="))
                    {
                        var version = line.Split('=')[1].Trim('"');
                        if (version.Contains("steamdeck"))
                            return true;
                    }
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex.ToString());
            }

            try
            {
                var hostname = Dns.GetHostName().ToLower();
                if (hostname.Contains("steamdeck"))
                    return true;
            }
            catch (Exception ex)
            {
                Log.Error(ex.ToString());
            }

            return false;
        }

        if (IsSteamDeck())
            return RuntimeSystem.STEAMDECK;

        return RuntimeSystem.LINUX;
    }

    private static SourceProvider GetSourceProvider()
    {
        if (IsFlatpak() && File.Exists("/app/manifest.json"))
        {
            return SourceProvider.Flathub;
        }

        return SourceProvider.GithubRelease;
    }

    // Migrate Flatpak org.chnapy.pkvault -> io.github.chnapy.pkvault, if relevant
    public static void FlatpakMigrateIfAny()
    {
        var dataToMigrate = GetFlatpakDataToMigrate();
        if (dataToMigrate.Length == 0)
            return;
            
        foreach(var (_, SrcPath, DestPath) in dataToMigrate)
        {
            CopyDirectory.CopyDirectoryRecursive(SrcPath, DestPath);
        }
        Log.Logger.Debug("Flatpak migration complete");

        FlatpakMigrated = true;
    }

    private static (string Folder, string SrcPath, string DestPath)[] GetFlatpakDataToMigrate()
    {
        if (!IsFlatpak()) {
            return [];
        }

        var dbAlreadyExists = File.Exists(
            MatcherUtil.NormalizePath(Path.Combine(
                GetAppDirectory(),
                GetDefaultSettingsMutable().DB_PATH,
                "pkvault.db"
            ))
        );
        if (dbAlreadyExists) {
            return [];
        }
        
        var dataPath = Path.Combine(MatcherUtil.NormalizePath(GetAppDirectory()), "../../org.chnapy.pkvault/data");
        if (!Directory.Exists(dataPath)) {
            return [];
        }

        var data = Directory.EnumerateDirectories(dataPath).Select(sourceDir =>
        {
            var folder = Path.GetFileName(sourceDir);

            return (
                Folder: folder, 
                SrcPath: sourceDir,
                DestPath: MatcherUtil.NormalizePath(Path.Combine(GetAppDirectory(), folder))
            );
        }).ToArray();

        Log.Debug($"Flatpak migrate from org.chnapy.pkvault - {data.Length} folders to migrate:\n{
            string.Join('\n', data
                .Select(f => $"{f.Folder} -- {f.SrcPath} -> {f.DestPath}")
            )
        }");

        return data;
    }

    public static bool IsFlatpak()
    {
        return !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("FLATPAK_ID"));
    }

    public static readonly string DefaultSavePath = "./pokemon-emerald-sample.sav";

    private static SettingsMutableDTO GetDefaultSettingsMutable()
    {
        SettingsMutableDTO settings;

#if DEBUG
        settings = new(
            DB_PATH: "./tmp/db",
            SAVE_GLOBS: [DefaultSavePath],
            PKM_EXTERNAL_GLOBS: [],
            STORAGE_PATH: "./tmp/storage",
            BACKUP_PATH: "./tmp/backup",
            HIDE_CHEATS: false,
            SKIP_LEGALITY_CHECKS: false,
            HTTPS_NOCERT: false
        );
#else
        settings = new(
            DB_PATH: "./db",
            SAVE_GLOBS: [DefaultSavePath],
            PKM_EXTERNAL_GLOBS: [],
            STORAGE_PATH: "./storage",
            BACKUP_PATH: "./backup",
            HIDE_CHEATS: false,
            SKIP_LEGALITY_CHECKS: false
        );
#endif

        return settings;
    }
}
