using System.Diagnostics;
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

    public static async Task<DateTime> CreateBackup()
    {
        Stopwatch sw = new();

        sw.Start();

        Console.WriteLine($"Create backup - start");

        var loaders = (await DataFileLoader.Create()).loaders;

        PrepareBkpDir();

        Console.WriteLine($"Create backup - DB");

        var dbPaths = CreateDbBackup(loaders);

        Console.WriteLine($"Create backup - Saves");

        var savesPaths = CreateSavesBackup();

        Console.WriteLine($"Create backup - Storage");

        var mainPaths = CreateMainBackup(loaders);

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

        Console.WriteLine($"Create backup - Compress");

        var dateTime = Compress();

        sw.Stop();

        Console.WriteLine($"Create backup - Done in {sw.Elapsed} !");

        return dateTime;
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

    private static Dictionary<string, string> CreateDbBackup(DataEntityLoaders loaders)
    {
        var bkpTmpDirPath = Path.Combine(bkpPath, bkpTempDir);

        var boxEntities = loaders.boxLoader.GetAllEntities();
        var pkmEntities = loaders.pkmLoader.GetAllEntities();
        var pkmVersionEntities = loaders.pkmVersionLoader.GetAllEntities();

        var boxPath = Path.Combine(Settings.dbDir, "box.json");
        var pkmPath = Path.Combine(Settings.dbDir, "pkm.json");
        var pkmVersionPath = Path.Combine(Settings.dbDir, "pkm-version.json");

        var relativeBoxPath = Path.Combine("db", "box.json");
        var relativePkmPath = Path.Combine("db", "pkm.json");
        var relativePkmVersionPath = Path.Combine("db", "pkm-version.json");

        // TODO part not safe, if data written is wrong, restore can break up whole app
        File.WriteAllText(
            Path.Combine(bkpTmpDirPath, relativeBoxPath),
            JsonSerializer.Serialize(boxEntities)
        );
        File.WriteAllText(
            Path.Combine(bkpTmpDirPath, relativePkmPath),
            JsonSerializer.Serialize(pkmEntities)
        );
        File.WriteAllText(
            Path.Combine(bkpTmpDirPath, relativePkmVersionPath),
            JsonSerializer.Serialize(pkmVersionEntities)
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

    private static Dictionary<string, string> CreateMainBackup(DataEntityLoaders loaders)
    {
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

            paths.Add(Path.Combine(relativeDirPath, filename), pkmVersion.PkmVersionEntity.Filepath);
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

    public static async Task RestoreBackup(DateTime createdAt)
    {
        var fileName = GetBackupFilename(createdAt);

        Console.WriteLine($"Backup restore {fileName}");

        var bkpZipPath = Path.Combine(bkpPath, fileName);
        if (!File.Exists(bkpZipPath))
        {
            throw new Exception($"File does not exist: {bkpZipPath}");
        }

        Stopwatch sw = new();

        sw.Start();

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

        // manual backup, no use of PrepareBackupThenRun to avoid infinite loop
        await CreateBackup();

        foreach (var entry in archive.Entries)
        {
            if (paths.ContainsKey(entry.FullName))
            {
                var path = paths[entry.FullName];

                Console.WriteLine($"Extract {entry.FullName} to {path}");

                entry.ExtractToFile(path, true);
            }
        }

        File.Delete(bkpTmpPathsPath);

        sw.Stop();

        Console.WriteLine($"Backup restore finished in {sw.Elapsed}");

        await LocalSaveService.ResetTimerAndData();

        await StorageService.ResetDataLoader();
    }

    public static async Task PrepareBackupThenRun(Func<Task> action)
    {
        var bkpDateTime = await CreateBackup();

        try
        {
            Stopwatch sw = new();

            Console.WriteLine($"Action run with backup fallback");

            sw.Start();

            await action();

            sw.Stop();

            Console.WriteLine($"Action finished in {sw.Elapsed}");

            await StorageService.ResetDataLoader();

            await WarningsService.CheckWarnings();
        }
        catch
        {
            await RestoreBackup(bkpDateTime);

            throw;
        }
    }
}
