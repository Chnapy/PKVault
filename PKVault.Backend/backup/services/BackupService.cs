using System.Globalization;
using System.IO.Compression;
using System.Text.Json;

/**
 * Backups creation, restore, remove and listing.
 */
public class BackupService(
    ILogger<BackupService> log,
    IServiceProvider sp, TimeProvider timeProvider,
    IFileIOService fileIOService, ISavesLoadersService savesLoadersService,
    ISettingsService settingsService, ISessionService sessionService
)
{
    private static readonly string dateTimeFormat = "yyyy-MM-ddTHHmmss-fffZ";

    public async Task<DateTime> CreateBackup(string name, DataUpdateFlags flags)
    {
        using var _ = log.Time("Create backup");

        var startTime = timeProvider.GetUtcNow().DateTime;

        var steptime = log.Time($"Create backup - DB");
        var dbPaths = await CreateDbBackup();
        steptime.Dispose();

        steptime = log.Time($"Create backup - Saves");
        var savesPaths = await CreateSavesBackup();
        steptime.Dispose();

        steptime = log.Time($"Create backup - Storage");
        var mainPaths = await CreateMainBackup();
        steptime.Dispose();

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

        steptime = log.Time($"Create backup - Compress");
        using (var memoryStream = new MemoryStream())
        {
            using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
            {
                foreach (var fileEntry in files)
                {
                    var fileContent = fileEntry.Value.FileContent;
                    var entry = archive.CreateEntry(fileEntry.Key, CompressionLevel.Optimal);
                    using var entryStream = await entry.OpenAsync();
                    await entryStream.WriteAsync(fileContent);
                }
            }

            var bkpPath = GetBackupsPath();
            var fileName = GetBackupFilename(startTime, name);
            var bkpZipPath = Path.Combine(bkpPath, fileName);

            await fileIOService.WriteBytes(bkpZipPath, memoryStream.ToArray());
            log.LogInformation($"Write backup to {bkpZipPath}");
        }
        steptime.Dispose();

        flags.Backups = true;

        return startTime;
    }

    private async Task<Dictionary<string, (string TargetPath, byte[] FileContent)>> CreateDbBackup()
    {
        var dict = new Dictionary<string, (string TargetPath, byte[] FileContent)>();

        var rawDbFilepath = sessionService.MainDbRelativePath;
        var dbFilepath = sessionService.MainDbPath;
        if (fileIOService.Exists(dbFilepath))
        {
            var fileName = Path.GetFileName(dbFilepath);
            var relativePath = Path.Combine("db", fileName);
            var content = await fileIOService.ReadBytes(dbFilepath);

            dict.Add(
                NormalizePath(relativePath),
                    (TargetPath: NormalizePath(rawDbFilepath), FileContent: content)
            );
        }

        var settings = settingsService.GetSettings();
        var dbPath = settings.SettingsMutable.DB_PATH;

        List<string> rawFilepaths = DataNormalizeAction.GetLegacyFilepaths(dbPath);
        foreach (var rawFilepath in rawFilepaths)
        {
            var filepath = MatcherUtil.NormalizePath(Path.Combine(SettingsService.GetAppDirectory(), rawFilepath));
            if (fileIOService.Exists(filepath))
            {
                var fileName = Path.GetFileName(filepath);
                var relativePath = Path.Combine("db", fileName);
                var content = await fileIOService.ReadBytes(filepath);

                dict.Add(
                    NormalizePath(relativePath),
                        (TargetPath: NormalizePath(rawFilepath), FileContent: content)
                );
            }
        }

        return dict;
    }

    private async Task<Dictionary<string, (string TargetPath, byte[] FileContent)>> CreateSavesBackup()
    {
        var paths = new Dictionary<string, (string TargetPath, byte[] FileContent)>();

        var savesPaths = savesLoadersService.GetSaveById().Values
            .Select(save => save.Metadata.FilePath);

        if (!savesPaths.Any())
        {
            return paths;
        }

        foreach (var path in savesPaths)
        {
            if (string.IsNullOrEmpty(path))
            {
                continue;
            }

            var filename = Path.GetFileNameWithoutExtension(path);
            var ext = Path.GetExtension(path);
            var hashCode = string.Format("{0:X}", path.GetHashCode());
            var newFilename = $"{filename}_{hashCode}{ext}";
            var relativePath = Path.Combine("saves", newFilename);

            var fileContent = await fileIOService.ReadBytes(path);

            paths.Add(NormalizePath(relativePath), (
                TargetPath: NormalizePath(path), FileContent: fileContent
            ));
        }

        return paths;
    }

    private async Task<Dictionary<string, (string TargetPath, byte[] FileContent)>> CreateMainBackup()
    {
        using var scope = sp.CreateScope();
        var pkmFileLoader = scope.ServiceProvider.GetRequiredService<IPkmFileLoader>();

        using var _ = log.Time($"Prepare storage PKM files backup");

        var paths = new Dictionary<string, (string TargetPath, byte[] FileContent)>();

        // get all PkmFile without distinction
        var allFilepaths = await pkmFileLoader.GetEnabledFilepaths();

        foreach(var filepath in allFilepaths)
        {
            var filename = Path.GetFileName(filepath);
            var dirname = new DirectoryInfo(Path.GetDirectoryName(filepath)!).Name;
            var relativeDirPath = Path.Combine("main", dirname);

            var backupPath = NormalizePath(Path.Combine(relativeDirPath, filename));

            // possible duplicates between relative/absolute paths
            if (paths.ContainsKey(backupPath))
            {
                log.LogWarning(
                    "Filepath already in current backup creation, skipping."
                    + $"\n\tBackup path (key) = {backupPath}"
                    + $"\n\tTarget path (new value) = {filepath}"
                    + $"\n\tTarget path (existing value) = {(paths.TryGetValue(backupPath, out var existing) ? existing.TargetPath : null)}"
                );
                continue;
            }

            try {
                var fileContent = await fileIOService.ReadBytes(filepath);
                var targetPayload = (TargetPath: filepath, FileContent: fileContent);
            
                paths.Add(backupPath, targetPayload);

            // it avoids to use fileIOService.Exists, performance reasons
            } catch(FileNotFoundException)
            {
            } catch(DirectoryNotFoundException)
            {
            }
        }

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

    private static string GetBackupFilename(DateTime createdAt, string name)
    {
        return $"{name}{GetBackupFilenameSuffix(createdAt)}";
    }

    private static string GetBackupFilenameSuffix(DateTime createdAt)
    {
        // 2026-03-18T232935-280Z => 22 chars
        return $"_{SerializeDateTime(createdAt)}.zip";
    }

    public List<BackupDTO> GetBackupList()
    {
        var bkpPath = GetBackupsPath();
        var glob = Path.Combine(bkpPath, "*.zip");
        var searchPaths = fileIOService.Matcher.SearchPaths([glob]);

        var result = searchPaths
            .Select(GetBackup)
            .OfType<BackupDTO>().ToList();

        result.Sort((a, b) => a.CreatedAt > b.CreatedAt ? -1 : 1);

        var fileCountLimit = EnvUtil.BACKUP_FILE_COUNT_LIMIT ?? 0;
        if (fileCountLimit > 0 && result.Count > fileCountLimit)
        {
            foreach(var bkp in result.Skip(fileCountLimit))
            {
                DeleteBackup(bkp.Filepath);
            }
            result = [.. result.Take(fileCountLimit)];
        }

        return result;
    }

    private BackupDTO? GetBackup(string path)
    {
        try
        {
            var filename = Path.GetFileNameWithoutExtension(path);
            var filenameParts = filename.Split('_');

            var name = string.Join('_', filenameParts.Take(filenameParts.Length - 1));

            var dateTimeStr = filenameParts.Last();
            var dateTime = DeserializeDateTime(dateTimeStr);

            return new BackupDTO(
                CreatedAt: dateTime,
                Filepath: path,
                Name: name
            );
        }
        catch (Exception err)
        {
            log.LogError(err, null);

            return null;
        }
    }

    private BackupDTO GetBackup(DateTime createdAt)
    {
        var bkpPath = GetBackupsPath();
        var glob = Path.Combine(bkpPath, $"*{GetBackupFilenameSuffix(createdAt)}");
        var searchPaths = fileIOService.Matcher.SearchPaths([glob]);

        var backups = searchPaths
            .Select(GetBackup)
            .Where(bkp => bkp != null);

        if (backups.Count() > 1)
        {
            throw new Exception($"Multiple backup files found with filename ending with {GetBackupFilenameSuffix(createdAt)}");
        }

        var bkp = backups.FirstOrDefault();
        ArgumentNullException.ThrowIfNull(bkp, $"Backup not found for glob={glob}");
        return bkp;
    }

    public void EditBackup(DateTime createdAt, string newName)
    {
        var backup = GetBackup(createdAt);

        if (backup.Name == newName)
        {
            return;
        }

        var invalidChars = Path.GetInvalidFileNameChars().ToHashSet();

        if (newName.Any(invalidChars.Contains))
        {
            throw new ArgumentException($"Invalid characters in '{newName}'");
        }

        var basePath = Path.GetDirectoryName(backup.Filepath);

        var newFilename = GetBackupFilename(createdAt, newName);
        var newPath = MatcherUtil.NormalizePath(
            basePath != null
                ? Path.Combine(basePath, newFilename)
                : newFilename
            );

        fileIOService.Move(backup.Filepath, newPath, overwrite: true);
    }

    public void DeleteBackup(DateTime createdAt)
    {
        var backup = GetBackup(createdAt);

        DeleteBackup(backup.Filepath);
    }

    public void DeleteBackup(string path)
    {
        var backup = GetBackup(path);
        ArgumentNullException.ThrowIfNull(backup, $"Backup not found for path={path}");

        fileIOService.Delete(backup.Filepath);
    }

    public async Task RestoreBackup(DateTime createdAt, bool withSafeBackup, DataUpdateFlags flags)
    {
        log.LogInformation($"Backup restore {createdAt}");

        var backup = GetBackup(createdAt);

        var logtime = log.Time("Backup restore");

        using var archive = fileIOService.ReadZip(backup.Filepath);

        var bkpPath = GetBackupsPath();

        var pathsEntry = archive.Entries.ToList().Find(entry => entry.Name == "_paths.json");
        if (pathsEntry == default)
        {
            throw new Exception("Paths entry not found");
        }

        var paths = JsonSerializer.Deserialize(
            await pathsEntry.GetContent(),
            EntityJsonContext.Default.DictionaryStringString
        );
        ArgumentNullException.ThrowIfNull(paths);

        if (withSafeBackup)
        {
            // manual backup, no use of PrepareBackupThenRun to avoid infinite loop
            await CreateBackup("backup_before_restore", flags);
        }

        var settings = settingsService.GetSettings();
        var dbPath = settings.GetDbPath();

        // remove current db file & old JSON files
        // to avoid remaining old data
        fileIOService.Delete(sessionService.MainDbPath);
        DataNormalizeAction.GetLegacyFilepaths(dbPath)
            .ForEach(filepath => fileIOService.Delete(filepath));

        var time = log.Time($"Extracting {archive.Entries.Count} files");

        foreach (var entry in archive.Entries)
        {
            if (
                paths.TryGetValue(entry.FullName, out var path)
                || paths.TryGetValue(entry.FullName.Replace('/', '\\'), out path)
            )
            {
                // log.LogInformation($"Extract {entry.FullName} to {path}");

                entry.ExtractToFile(path, true);
            }
        }

        time.Dispose();

        logtime.Dispose();

        savesLoadersService.Clear();
        await sessionService.StartNewSession(checkInitialActions: true, flags);
    }

    public async Task PrepareBackupThenRun(string backupName, DataUpdateFlags flags, Func<Task> action)
    {
        var bkpDateTime = await CreateBackup(backupName, flags);

        try
        {
            var logtime = log.Time("Action run with backup fallback");

            await action();

            logtime.Dispose();

            savesLoadersService.Clear();
            await sessionService.StartNewSession(checkInitialActions: false, flags);
        }
        catch (Exception ex)
        {
            log.LogError(ex.ToString());

            await RestoreBackup(bkpDateTime, withSafeBackup: false, flags);

            throw;
        }
    }

    private string GetBackupsPath()
    {
        var backupPath = settingsService.GetSettings().GetBackupPath();
        fileIOService.CreateDirectory(backupPath);
        return backupPath;
    }
}
