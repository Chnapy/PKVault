using System.Globalization;
using System.IO.Compression;
using System.Text.Json;

public class BackupService
{
    private static string bkpTempDir = ".bkp";

    private static string dateTimeFormat = "yyyy-MM-ddTHHmmss-fffZ";

    public static DateTime CreateBackup()
    {
        var bkpPath = GetBackupsPath();

        var logtime = LogUtil.Time("Create backup");

        var loaders = DataFileLoader.Create().loaders;

        PrepareBkpDir();

        var steptime = LogUtil.Time($"Create backup - DB");

        var dbPaths = CreateDbBackup(loaders);

        steptime();
        steptime = LogUtil.Time($"Create backup - Saves");

        var savesPaths = CreateSavesBackup();

        steptime();
        steptime = LogUtil.Time($"Create backup - Storage");

        var mainPaths = CreateMainBackup(loaders);

        steptime();

        var paths = new Dictionary<string, string>()
            .Concat(dbPaths)
            .Concat(savesPaths)
            .Concat(mainPaths)
            .ToDictionary();

        var bkpTmpDirPath = Path.Combine(bkpPath, bkpTempDir);
        File.WriteAllText(
            Path.Combine(bkpTmpDirPath, "_paths.json"),
            JsonSerializer.Serialize(paths, EntitiesJsonContext.Default.DictionaryStringString)
        );

        steptime = LogUtil.Time($"Create backup - Compress");

        var dateTime = Compress();

        steptime();
        logtime();

        return dateTime;
    }

    private static void PrepareBkpDir()
    {
        var bkpPath = GetBackupsPath();

        var bkpTmpDirPath = Path.Combine(bkpPath, bkpTempDir);
        var bkpDbDirPath = Path.Combine(bkpTmpDirPath, "db");
        var bkpSavesDirPath = Path.Combine(bkpTmpDirPath, "saves");
        var bkpMainDirPath = Path.Combine(bkpTmpDirPath, "main");

        if (Directory.Exists(bkpTmpDirPath))
        {
            Directory.Delete(bkpTmpDirPath, true);
        }

        Directory.CreateDirectory(bkpTmpDirPath);
        Directory.CreateDirectory(bkpDbDirPath);
        Directory.CreateDirectory(bkpSavesDirPath);
        Directory.CreateDirectory(bkpMainDirPath);
    }

    private static Dictionary<string, string> CreateDbBackup(DataEntityLoaders loaders)
    {
        var bkpPath = GetBackupsPath();

        var bkpTmpDirPath = Path.Combine(bkpPath, bkpTempDir);

        var boxEntities = loaders.boxLoader.GetAllEntities();
        var pkmEntities = loaders.pkmLoader.GetAllEntities();
        var pkmVersionEntities = loaders.pkmVersionLoader.GetAllEntities();

        var dbDir = SettingsService.AppSettings.SettingsMutable.DB_PATH;

        var boxPath = Path.Combine(dbDir, "box.json");
        var pkmPath = Path.Combine(dbDir, "pkm.json");
        var pkmVersionPath = Path.Combine(dbDir, "pkm-version.json");

        var relativeBoxPath = Path.Combine("db", "box.json");
        var relativePkmPath = Path.Combine("db", "pkm.json");
        var relativePkmVersionPath = Path.Combine("db", "pkm-version.json");

        File.WriteAllText(
            Path.Combine(bkpTmpDirPath, relativeBoxPath),
            JsonSerializer.Serialize(boxEntities, EntitiesJsonContext.Default.DictionaryStringBoxEntity)
        );
        File.WriteAllText(
            Path.Combine(bkpTmpDirPath, relativePkmPath),
            JsonSerializer.Serialize(pkmEntities, EntitiesJsonContext.Default.DictionaryStringPkmEntity)
        );
        File.WriteAllText(
            Path.Combine(bkpTmpDirPath, relativePkmVersionPath),
            JsonSerializer.Serialize(pkmVersionEntities, EntitiesJsonContext.Default.DictionaryStringPkmVersionEntity)
        );

        return new()
        {
            [NormalizePath(relativeBoxPath)] = NormalizePath(boxPath),
            [NormalizePath(relativePkmPath)] = NormalizePath(pkmPath),
            [NormalizePath(relativePkmVersionPath)] = NormalizePath(pkmVersionPath),
        };
    }

    private static Dictionary<string, string> CreateSavesBackup()
    {
        var bkpPath = GetBackupsPath();
        var globs = SettingsService.AppSettings.SettingsMutable.SAVE_GLOBS;
        var searchPaths = MatcherUtil.SearchPaths(globs);

        var paths = new Dictionary<string, string>();

        var bkpTmpDirPath = Path.Combine(bkpPath, bkpTempDir);

        foreach (var path in searchPaths)
        {
            var filename = Path.GetFileNameWithoutExtension(path);
            var ext = Path.GetExtension(path);

            var hashCode = string.Format("{0:X}", path.GetHashCode());

            var newFilename = $"{filename}_{hashCode}{ext}";

            var relativePath = Path.Combine("saves", newFilename);

            var newPath = Path.Combine(bkpTmpDirPath, relativePath);

            File.Copy(path, newPath);

            paths.Add(NormalizePath(relativePath), NormalizePath(path));
        }

        return paths;
    }

    private static Dictionary<string, string> CreateMainBackup(DataEntityLoaders loaders)
    {
        var bkpPath = GetBackupsPath();

        var bkpTmpDirPath = Path.Combine(bkpPath, bkpTempDir);
        var bkpMainDirPath = Path.Combine(bkpTmpDirPath, "main");

        var pkmVersions = loaders.pkmVersionLoader.GetAllDtos();

        var paths = new Dictionary<string, string>();

        pkmVersions.ForEach(pkmVersion =>
        {
            var filename = Path.GetFileName(pkmVersion.PkmVersionEntity.Filepath);
            var dirname = new DirectoryInfo(Path.GetDirectoryName(pkmVersion.PkmVersionEntity.Filepath)!).Name;
            var relativeDirPath = Path.Combine("main", dirname);
            var dirPath = Path.Combine(bkpTmpDirPath, relativeDirPath);

            Directory.CreateDirectory(dirPath);

            var newPath = Path.Combine(dirPath, filename);

            // Console.WriteLine(newPath);

            File.Copy(pkmVersion.PkmVersionEntity.Filepath, newPath);

            paths.Add(
                NormalizePath(Path.Combine(relativeDirPath, filename)),
                NormalizePath(pkmVersion.PkmVersionEntity.Filepath)
            );
        });

        return paths;
    }

    private static string NormalizePath(string path) => path.Replace('\\', '/');

    private static string SerializeDateTime(DateTime dateTime)
    {
        return dateTime.ToString(dateTimeFormat);
    }

    private static DateTime DeserializeDateTime(string str)
    {
        return DateTime.ParseExact(str, dateTimeFormat, CultureInfo.InvariantCulture);
    }

    private static string GetBackupFilename(DateTime createdAt)
    {
        return $"pkvault_backup_{SerializeDateTime(createdAt)}.zip";
    }

    private static DateTime Compress()
    {
        var bkpPath = GetBackupsPath();

        var dateTime = DateTime.UtcNow;

        var bkpTmpDirPath = Path.Combine(bkpPath, bkpTempDir);
        var fileName = GetBackupFilename(dateTime);
        var bkpZipPath = Path.Combine(bkpPath, fileName);

        ZipFile.CreateFromDirectory(bkpTmpDirPath, bkpZipPath, CompressionLevel.Fastest, false);

        Console.WriteLine($"Create backup - Zip in {bkpZipPath}");

        Directory.Delete(bkpTmpDirPath, true);

        return dateTime;
    }

    public static List<BackupDTO> GetBackupList()
    {
        var bkpPath = GetBackupsPath();
        var glob = Path.Combine(bkpPath, "*.zip");
        var searchPaths = MatcherUtil.SearchPaths([glob]);

        var result = searchPaths.Select(path =>
        {
            try
            {
                var filename = Path.GetFileNameWithoutExtension(path);
                var dateTimeStr = filename.Split('_').Last();

                var dateTime = DeserializeDateTime(dateTimeStr);

                return new BackupDTO()
                {
                    CreatedAt = dateTime,
                };
            }
            catch (Exception err)
            {
                Console.WriteLine(err);

                return null;
            }
        }).OfType<BackupDTO>().ToList();
        result.Sort((a, b) => a.CreatedAt > b.CreatedAt ? -1 : 1);
        return result;
    }

    public static void DeleteBackup(DateTime createdAt)
    {
        var bkpPath = GetBackupsPath();

        var fileName = GetBackupFilename(createdAt);
        var bkpZipPath = Path.Combine(bkpPath, fileName);

        if (!File.Exists(bkpZipPath))
        {
            throw new KeyNotFoundException($"File does not exist: {bkpZipPath}");
        }

        File.Delete(bkpZipPath);
    }

    public static async Task RestoreBackup(DateTime createdAt)
    {
        var bkpPath = GetBackupsPath();

        var fileName = GetBackupFilename(createdAt);

        Console.WriteLine($"Backup restore {fileName}");

        var bkpZipPath = Path.Combine(bkpPath, fileName);
        if (!File.Exists(bkpZipPath))
        {
            throw new Exception($"File does not exist: {bkpZipPath}");
        }

        var logtime = LogUtil.Time("Backup restore");

        using var archive = ZipFile.OpenRead(bkpZipPath);

        var bkpTmpPathsPath = Path.Combine(bkpPath, "._paths.json");

        var pathsEntry = archive.Entries.ToList().Find(entry => entry.Name == "_paths.json");
        if (pathsEntry == default)
        {
            throw new Exception("Paths entry not found");
        }

        pathsEntry.ExtractToFile(bkpTmpPathsPath, true);

        var paths = JsonSerializer.Deserialize(
            File.ReadAllText(bkpTmpPathsPath),
            EntitiesJsonContext.Default.DictionaryStringString
        );

        // manual backup, no use of PrepareBackupThenRun to avoid infinite loop
        CreateBackup();

        foreach (var entry in archive.Entries)
        {
            if (
                paths!.TryGetValue(entry.FullName, out var path)
                || paths.TryGetValue(entry.FullName.Replace('/', '\\'), out path)
            )
            {
                Console.WriteLine($"Extract {entry.FullName} to {path}");

                entry.ExtractToFile(path, true);
            }
        }

        File.Delete(bkpTmpPathsPath);

        logtime();

        LocalSaveService.ReadLocalSaves();
        StorageService.CleanWrongData();
        await StorageService.ResetDataLoader(true);
    }

    public static async Task PrepareBackupThenRun(Func<Task> action)
    {
        var bkpDateTime = CreateBackup();

        try
        {
            var logtime = LogUtil.Time("Action run with backup fallback");

            await action();

            logtime();

            LocalSaveService.ReadLocalSaves();

            await StorageService.ResetDataLoader(false);
        }
        catch
        {
            await RestoreBackup(bkpDateTime);

            throw;
        }
    }

    private static string GetBackupsPath()
    {
        return SettingsService.AppSettings.SettingsMutable.BACKUP_PATH;
    }
}
