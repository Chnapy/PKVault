using System.Globalization;
using System.IO.Compression;
using System.Text.Json;
using Microsoft.Extensions.FileSystemGlobbing;
using Microsoft.Extensions.FileSystemGlobbing.Abstractions;

public class BackupService
{
    private static string bkpPath = "/root/projects/pkvault/tmp/bkp";
    private static string bkpTempDir = ".bkp";

    private static string dateTimeFormat = "yyyy-MM-ddTHHmmss-fffZ";

    public static DateTime CreateBackup()
    {
        PrepareBkpDir();

        var dbPaths = CreateDbBackup();
        var savesPaths = CreateSavesBackup();
        var mainPaths = CreateMainBackup();

        var paths = new Dictionary<string, string>()
            .Concat(dbPaths)
            .Concat(savesPaths)
            .Concat(mainPaths)
            .ToDictionary();

        var bkpTmpDirPath = Path.Combine(bkpPath, bkpTempDir);
        File.WriteAllText(
            Path.Combine(bkpTmpDirPath, "_paths.json"),
            JsonSerializer.Serialize(paths)
        );

        return Compress();
    }

    private static void PrepareBkpDir()
    {
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

    private static Dictionary<string, string> CreateDbBackup()
    {
        var bkpTmpDirPath = Path.Combine(bkpPath, bkpTempDir);

        var loaders = new DataFileLoader().loaders;
        var boxes = loaders.boxLoader.GetAllEntities();
        var pkms = loaders.pkmLoader.GetAllEntities();
        var pkmVersions = loaders.pkmVersionLoader.GetAllEntities();

        var boxPath = Path.Combine(Settings.dbDir, "box.json");
        var pkmPath = Path.Combine(Settings.dbDir, "pkm.json");
        var pkmVersionPath = Path.Combine(Settings.dbDir, "pkm-version.json");

        var relativeBoxPath = Path.Combine("db", "box.json");
        var relativePkmPath = Path.Combine("db", "pkm.json");
        var relativePkmVersionPath = Path.Combine("db", "pkm-version.json");

        File.WriteAllText(
            Path.Combine(bkpTmpDirPath, relativeBoxPath),
            JsonSerializer.Serialize(boxes)
        );
        File.WriteAllText(
            Path.Combine(bkpTmpDirPath, relativePkmPath),
            JsonSerializer.Serialize(pkms)
        );
        File.WriteAllText(
            Path.Combine(bkpTmpDirPath, relativePkmVersionPath),
            JsonSerializer.Serialize(pkmVersions)
        );

        return new()
        {
            [relativeBoxPath] = boxPath,
            [relativePkmPath] = pkmPath,
            [relativePkmVersionPath] = pkmVersionPath,
        };
    }

    private static Dictionary<string, string> CreateSavesBackup()
    {
        var rootDir = Settings.rootDir;
        var globs = Settings.savesGlobs.ToList();

        var matcher = new Matcher();
        globs.ForEach(glob => matcher.AddInclude(glob));
        var matches = matcher.Execute(new DirectoryInfoWrapper(new DirectoryInfo(rootDir)));

        var paths = new Dictionary<string, string>();

        var bkpTmpDirPath = Path.Combine(bkpPath, bkpTempDir);

        foreach (var file in matches.Files)
        {
            var path = Path.Combine(rootDir, file.Path);
            var filename = Path.GetFileNameWithoutExtension(path);
            var ext = Path.GetExtension(path);

            var hashCode = string.Format("{0:X}", path.GetHashCode());

            var newFilename = $"{filename}_{hashCode}{ext}";

            var relativePath = Path.Combine("saves", newFilename);

            var newPath = Path.Combine(bkpTmpDirPath, relativePath);

            File.Copy(path, newPath);

            paths.Add(relativePath, path);
        }

        return paths;
    }

    private static Dictionary<string, string> CreateMainBackup()
    {
        var bkpTmpDirPath = Path.Combine(bkpPath, bkpTempDir);
        var bkpMainDirPath = Path.Combine(bkpTmpDirPath, "main");

        var loaders = new DataFileLoader().loaders;
        var pkmVersions = loaders.pkmVersionLoader.GetAllEntities();

        var paths = new Dictionary<string, string>();

        pkmVersions.ForEach(pkmVersion =>
        {
            var filename = Path.GetFileName(pkmVersion.Filepath);
            var dirname = new DirectoryInfo(Path.GetDirectoryName(pkmVersion.Filepath)!).Name;
            var relativeDirPath = Path.Combine("main", dirname);
            var dirPath = Path.Combine(bkpTmpDirPath, relativeDirPath);

            Directory.CreateDirectory(dirPath);

            var newPath = Path.Combine(dirPath, filename);

            Console.WriteLine(newPath);

            File.Copy(pkmVersion.Filepath, newPath);

            paths.Add(Path.Combine(relativeDirPath, filename), pkmVersion.Filepath);
        });

        return paths;
    }

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
        var dateTime = DateTime.UtcNow;

        var bkpTmpDirPath = Path.Combine(bkpPath, bkpTempDir);
        var fileName = GetBackupFilename(dateTime);
        var bkpZipPath = Path.Combine(bkpPath, fileName);

        ZipFile.CreateFromDirectory(bkpTmpDirPath, bkpZipPath);

        Directory.Delete(bkpTmpDirPath, true);

        return dateTime;
    }

    public static List<BackupDTO> GetBackupList()
    {
        var glob = Path.Combine(bkpPath, "*.zip");

        var matcher = new Matcher();
        matcher.AddInclude(glob);
        var matches = matcher.Execute(new DirectoryInfoWrapper(new DirectoryInfo(Settings.rootDir)));

        var result = matches.Files.Select(file =>
        {
            try
            {
                var path = Path.Combine(Settings.rootDir, file.Path);

                var filename = Path.GetFileNameWithoutExtension(file.Path);
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
        var fileName = GetBackupFilename(createdAt);
        var bkpZipPath = Path.Combine(bkpPath, fileName);

        if (!File.Exists(bkpZipPath))
        {
            throw new Exception($"File does not exist: {bkpZipPath}");
        }

        File.Delete(bkpZipPath);
    }

    public static void RestoreBackup(DateTime createdAt)
    {
        var fileName = GetBackupFilename(createdAt);

        Console.WriteLine($"Restore backup {fileName}");

        var bkpZipPath = Path.Combine(bkpPath, fileName);
        if (!File.Exists(bkpZipPath))
        {
            throw new Exception($"File does not exist: {bkpZipPath}");
        }

        using var archive = ZipFile.OpenRead(bkpZipPath);

        var bkpTmpPathsPath = Path.Combine(bkpPath, "._paths.json");

        var pathsEntry = archive.Entries.ToList().Find(entry => entry.Name == "_paths.json");
        if (pathsEntry == default)
        {
            throw new Exception("Paths entry not found");
        }

        pathsEntry.ExtractToFile(bkpTmpPathsPath, true);

        var paths = JsonSerializer.Deserialize<Dictionary<string, string>>(
            File.ReadAllText(bkpTmpPathsPath)
        );

        // manual backup, no use or PrepareBackupThenRun to avoid infinite loop
        CreateBackup();

        foreach (var entry in archive.Entries)
        {
            if (paths.ContainsKey(entry.FullName))
            {
                var path = paths[entry.FullName];

                Console.WriteLine($"Extract {entry.FullName} to {path}");

                entry.ExtractToFile(path, true);
            }
        }

        LocalSaveService.ResetTimerAndData();

        StorageService.ResetDataLoader();

        File.Delete(bkpTmpPathsPath);
    }

    public static async Task PrepareBackupThenRun(Func<Task> action)
    {
        var bkpDateTime = CreateBackup();

        try
        {
            await action();

            StorageService.ResetDataLoader();

            WarningsService.CheckWarnings();
        }
        catch
        {
            RestoreBackup(bkpDateTime);

            throw;
        }
    }
}
