using System.Globalization;
using System.IO.Compression;
using System.Text.Json;

public class BackupService
{
    private static readonly string dateTimeFormat = "yyyy-MM-ddTHHmmss-fffZ";

    public static DateTime CreateBackup()
    {
        var logtime = LogUtil.Time("Create backup");

        var loader = DataMemoryLoader.Create();

        var steptime = LogUtil.Time($"Create backup - DB");
        var dbPaths = CreateDbBackup(loader.loaders);
        steptime();

        steptime = LogUtil.Time($"Create backup - Saves");
        var savesPaths = CreateSavesBackup(loader.loaders);
        steptime();

        steptime = LogUtil.Time($"Create backup - Storage");
        var mainPaths = CreateMainBackup(loader.loaders);
        steptime();

        var files = new Dictionary<string, (string TargetPath, byte[] FileContent)>()
            .Concat(dbPaths)
            .Concat(savesPaths)
            .Concat(mainPaths)
            .ToDictionary();

        var paths = files.ToDictionary(pair => pair.Key, pair => pair.Value.TargetPath);

        files.Add("_paths.json", (
            TargetPath: "",
            FileContent: JsonSerializer.SerializeToUtf8Bytes(paths, EntityJsonContext.Default.DictionaryStringString)
        ));

        steptime = LogUtil.Time($"Create backup - Compress");
        using (var memoryStream = new MemoryStream())
        {
            using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
            {
                foreach (var fileEntry in files)
                {
                    var fileContent = fileEntry.Value.FileContent;
                    var entry = archive.CreateEntry(fileEntry.Key, CompressionLevel.Optimal);
                    using var entryStream = entry.Open();
                    entryStream.Write(fileContent, 0, fileContent.Length);
                    // Console.WriteLine(fileEntry.Key);
                }
            }

            var bkpPath = GetBackupsPath();
            var fileName = GetBackupFilename(loader.startTime);
            var bkpZipPath = Path.Combine(bkpPath, fileName);

            File.WriteAllBytes(bkpZipPath, memoryStream.ToArray());
        }
        steptime();

        logtime();

        return loader.startTime;
    }

    private static Dictionary<string, (string TargetPath, byte[] FileContent)> CreateDbBackup(DataEntityLoaders loaders)
    {
        var bankEntities = loaders.bankLoader.GetAllEntities();
        var boxEntities = loaders.boxLoader.GetAllEntities();
        var pkmEntities = loaders.pkmLoader.GetAllEntities();
        var pkmVersionEntities = loaders.pkmVersionLoader.GetAllEntities();

        var bankPath = loaders.bankLoader.FilePath;
        var boxPath = loaders.boxLoader.FilePath;
        var pkmPath = loaders.pkmLoader.FilePath;
        var pkmVersionPath = loaders.pkmVersionLoader.FilePath;

        var relativeBankPath = Path.Combine("db", "bank.json");
        var relativeBoxPath = Path.Combine("db", "box.json");
        var relativePkmPath = Path.Combine("db", "pkm.json");
        var relativePkmVersionPath = Path.Combine("db", "pkm-version.json");

        var bankContent = JsonSerializer.SerializeToUtf8Bytes(bankEntities, EntityJsonContext.Default.DictionaryStringBankEntity);
        var boxContent = JsonSerializer.SerializeToUtf8Bytes(boxEntities, EntityJsonContext.Default.DictionaryStringBoxEntity);
        var pkmContent = JsonSerializer.SerializeToUtf8Bytes(pkmEntities, EntityJsonContext.Default.DictionaryStringPkmEntity);
        var pkmVersionContent = JsonSerializer.SerializeToUtf8Bytes(pkmVersionEntities, EntityJsonContext.Default.DictionaryStringPkmVersionEntity);

        return new()
        {
            [NormalizePath(relativeBankPath)] = (TargetPath: NormalizePath(bankPath), FileContent: bankContent),
            [NormalizePath(relativeBoxPath)] = (TargetPath: NormalizePath(boxPath), FileContent: boxContent),
            [NormalizePath(relativePkmPath)] = (TargetPath: NormalizePath(pkmPath), FileContent: pkmContent),
            [NormalizePath(relativePkmVersionPath)] = (TargetPath: NormalizePath(pkmVersionPath), FileContent: pkmVersionContent),
        };
    }

    private static Dictionary<string, (string TargetPath, byte[] FileContent)> CreateSavesBackup(DataEntityLoaders loaders)
    {
        var paths = new Dictionary<string, (string TargetPath, byte[] FileContent)>();
        if (loaders.saveLoadersDict.Count == 0)
        {
            return paths;
        }

        foreach (var saveLoader in loaders.saveLoadersDict.Values)
        {
            var path = saveLoader.Save.Metadata.FilePath;
            ArgumentNullException.ThrowIfNull(path);

            var filename = Path.GetFileNameWithoutExtension(path);
            var ext = Path.GetExtension(path);
            var hashCode = string.Format("{0:X}", path.GetHashCode());
            var newFilename = $"{filename}_{hashCode}{ext}";
            var relativePath = Path.Combine("saves", newFilename);

            paths.Add(NormalizePath(relativePath), (
                TargetPath: NormalizePath(path), FileContent: LocalSaveService.GetSaveFileData(saveLoader.Save)
            ));
        }

        return paths;
    }

    private static Dictionary<string, (string TargetPath, byte[] FileContent)> CreateMainBackup(DataEntityLoaders loaders)
    {
        var pkmFilesDict = loaders.pkmVersionLoader.pkmFileLoader.GetAllEntities();

        var paths = new Dictionary<string, (string TargetPath, byte[] FileContent)>();
        if (pkmFilesDict.Values.Count == 0)
        {
            return paths;
        }

        pkmFilesDict.ToList().ForEach(pair =>
        {
            var filepath = pair.Key;
            var filename = Path.GetFileName(filepath);
            var dirname = new DirectoryInfo(Path.GetDirectoryName(filepath)!).Name;
            var relativeDirPath = Path.Combine("main", dirname);

            paths.Add(
                NormalizePath(Path.Combine(relativeDirPath, filename)),
                (TargetPath: filepath, FileContent: pair.Value)
            );
        });

        return paths;
    }

    private static string NormalizePath(string path) => MatcherUtil.NormalizePath(path);

    public static string SerializeDateTime(DateTime dateTime)
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

        // TODO read in-memory
        pathsEntry.ExtractToFile(bkpTmpPathsPath, true);

        var paths = JsonSerializer.Deserialize(
            File.ReadAllText(bkpTmpPathsPath),
            EntityJsonContext.Default.DictionaryStringString
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
        var backupPath = SettingsService.AppSettings.SettingsMutable.BACKUP_PATH;
        Directory.CreateDirectory(backupPath);
        return backupPath;
    }
}
