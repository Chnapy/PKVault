using System.Globalization;
using System.IO.Compression;
using System.Text.Json;

/**
 * Backups creation, restore, remove and listing.
 */
public class BackupService(
    IServiceProvider sp,
    IFileIOService fileIOService, ISaveService saveService,
    ISettingsService settingsService, SessionService sessionService
)
{
    private static readonly string dateTimeFormat = "yyyy-MM-ddTHHmmss-fffZ";

    public async Task<DateTime> CreateBackup()
    {
        using var _ = LogUtil.Time("Create backup");

        var startTime = DateTime.UtcNow;

        var steptime = LogUtil.Time($"Create backup - DB");
        var dbPaths = CreateDbBackup();
        steptime.Stop();

        steptime = LogUtil.Time($"Create backup - Saves");
        var savesPaths = await CreateSavesBackup();
        steptime.Stop();

        steptime = LogUtil.Time($"Create backup - Storage");
        var mainPaths = await CreateMainBackup();
        steptime.Stop();

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
                }
            }

            var bkpPath = GetBackupsPath();
            var fileName = GetBackupFilename(startTime);
            var bkpZipPath = Path.Combine(bkpPath, fileName);

            fileIOService.WriteBytes(bkpZipPath, memoryStream.ToArray());
            Console.WriteLine($"Write backup to {bkpZipPath}");
        }
        steptime.Stop();

        return startTime;
    }

    private Dictionary<string, (string TargetPath, byte[] FileContent)> CreateDbBackup()
    {
        var dict = new Dictionary<string, (string TargetPath, byte[] FileContent)>();

        var filePath = sessionService.MainDbPath;
        if (fileIOService.Exists(filePath))
        {
            var fileName = Path.GetFileName(filePath);
            var relativePath = Path.Combine("db", fileName);
            var content = fileIOService.ReadBytes(filePath);

            dict.Add(
                NormalizePath(relativePath),
                    (TargetPath: NormalizePath(filePath), FileContent: content)
            );
        }

        return dict;
    }

    private async Task<Dictionary<string, (string TargetPath, byte[] FileContent)>> CreateSavesBackup()
    {
        var paths = new Dictionary<string, (string TargetPath, byte[] FileContent)>();

        var savesById = await saveService.GetSaveById();

        if (savesById.Count == 0)
        {
            return paths;
        }

        foreach (var save in savesById.Values)
        {
            var path = save.Metadata.FilePath;
            if (string.IsNullOrEmpty(path))
            {
                continue;
            }

            var filename = Path.GetFileNameWithoutExtension(path);
            var ext = Path.GetExtension(path);
            var hashCode = string.Format("{0:X}", path.GetHashCode());
            var newFilename = $"{filename}_{hashCode}{ext}";
            var relativePath = Path.Combine("saves", newFilename);

            paths.Add(NormalizePath(relativePath), (
                TargetPath: NormalizePath(path), FileContent: save.GetSaveFileData()
            ));
        }

        return paths;
    }

    private async Task<Dictionary<string, (string TargetPath, byte[] FileContent)>> CreateMainBackup()
    {
        using var scope = sp.CreateScope();
        var pkmFileLoader = scope.ServiceProvider.GetRequiredService<IPkmFileLoader>();

        var paths = new Dictionary<string, (string TargetPath, byte[] FileContent)>();

        (await pkmFileLoader.GetEnabledEntities())
            .ForEach(pkmFile =>
            {
                if (pkmFile.Error != null)
                {
                    return;
                }

                var filepath = pkmFile.Filepath;

                if (!fileIOService.Exists(filepath))
                {
                    return;
                }

                var filename = Path.GetFileName(filepath);
                var dirname = new DirectoryInfo(Path.GetDirectoryName(filepath)!).Name;
                var relativeDirPath = Path.Combine("main", dirname);

                paths.Add(
                    NormalizePath(Path.Combine(relativeDirPath, filename)),
                    (TargetPath: filepath, FileContent: pkmFile.Data)
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

    public List<BackupDTO> GetBackupList()
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

                return new BackupDTO(
                    CreatedAt: dateTime,
                    Filepath: path
                );
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

    public void DeleteBackup(DateTime createdAt)
    {
        var bkpPath = GetBackupsPath();

        var fileName = GetBackupFilename(createdAt);
        var bkpZipPath = Path.Combine(bkpPath, fileName);

        fileIOService.Delete(bkpZipPath);
    }

    public async Task RestoreBackup(DateTime createdAt)
    {
        var bkpPath = GetBackupsPath();

        var fileName = GetBackupFilename(createdAt);

        Console.WriteLine($"Backup restore {fileName}");

        var bkpZipPath = Path.Combine(bkpPath, fileName);
        if (!fileIOService.Exists(bkpZipPath))
        {
            throw new Exception($"File does not exist: {bkpZipPath}");
        }

        var logtime = LogUtil.Time("Backup restore");

        using var archive = fileIOService.ReadZip(bkpZipPath);

        var bkpTmpPathsPath = Path.Combine(bkpPath, "._paths.json");

        var pathsEntry = archive.Entries.ToList().Find(entry => entry.Name == "_paths.json");
        if (pathsEntry == default)
        {
            throw new Exception("Paths entry not found");
        }

        // TODO read in-memory
        pathsEntry.ExtractToFile(bkpTmpPathsPath, true);

        var paths = fileIOService.ReadJSONFile(
            bkpTmpPathsPath,
            EntityJsonContext.Default.DictionaryStringString
        );

        ArgumentNullException.ThrowIfNull(paths, bkpTmpPathsPath);

        // manual backup, no use of PrepareBackupThenRun to avoid infinite loop
        await CreateBackup();

        // remove current db file
        // to avoid remaining old data
        fileIOService.Delete(sessionService.MainDbPath);

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

        fileIOService.Delete(bkpTmpPathsPath);

        logtime.Stop();

        saveService.InvalidateSaves();
        await sessionService.StartNewSession(checkSynchronize: true);
    }

    public async Task PrepareBackupThenRun(Func<Task> action)
    {
        var bkpDateTime = await CreateBackup();

        try
        {
            var logtime = LogUtil.Time("Action run with backup fallback");

            await action();

            logtime.Stop();

            saveService.InvalidateSaves();
            await sessionService.StartNewSession(checkSynchronize: false);
        }
        catch
        {
            await RestoreBackup(bkpDateTime);

            throw;
        }
    }

    private string GetBackupsPath()
    {
        var backupPath = settingsService.GetSettings().SettingsMutable.BACKUP_PATH;
        fileIOService.CreateDirectory(backupPath);
        return backupPath;
    }
}
