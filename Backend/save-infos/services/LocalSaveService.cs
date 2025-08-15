using Microsoft.Extensions.FileSystemGlobbing;
using Microsoft.Extensions.FileSystemGlobbing.Abstractions;
using PKHeX.Core;

public class LocalSaveService
{
    public static Dictionary<uint, SaveFile> SaveById { get; } = [];
    public static Dictionary<string, SaveFile> SaveByPath { get; } = [];

    // private static List<FileSystemWatcher> watchers = [];
    private const int TIMER_INTERVAL = 30;
    private static Timer? Timer;

    public static void PrepareTimer()
    {
        Timer = new Timer(ReadLocalSaves, null, TimeSpan.Zero, TimeSpan.FromSeconds(TIMER_INTERVAL));
    }

    public static void ReadLocalSaves(object? state)
    {
        var rootDir = Settings.rootDir;
        var globs = Settings.savesGlobs.ToList();

        var matcher = new Matcher();
        globs.ForEach(glob => matcher.AddInclude(glob));
        matcher.AddExclude(Path.Combine("**", Settings.backupDir));
        var matches = matcher.Execute(new DirectoryInfoWrapper(new DirectoryInfo(rootDir)));

        var hasBeenUpdated = false;

        foreach (var file in matches.Files)
        {
            var path = Path.Combine(rootDir, file.Path);

            var updated = UpdateSaveFromPath(path);
            if (updated)
            {
                hasBeenUpdated = true;
            }
        }

        if (hasBeenUpdated)
        {
            WarningsService.CheckWarnings();
        }

        // alerts.ForEach(alert => Console.WriteLine($"Alert: {alert}"));

        // watchers = [];
        // globs.ForEach(glob =>
        // {
        //     var watcher = new FileSystemWatcher(rootDir, glob)
        //     {
        //         IncludeSubdirectories = true,
        //         EnableRaisingEvents = true,
        //         // NotifyFilter = NotifyFilters.LastWrite
        //     };

        //     watcher.Created += (s, e) => UpdateSaveFromPath(e.FullPath);
        //     watcher.Changed += (s, e) => UpdateSaveFromPath(e.FullPath);
        //     watcher.Deleted += (s, e) => DeleteSaveFromPath(e.FullPath);
        //     watcher.Renamed += (s, e) => UpdateSaveFromPath(e.FullPath);

        //     watchers.Add(watcher);
        // });

        Console.WriteLine("Read local save ended");
    }

    private static bool UpdateSaveFromPath(string path)
    {
        // Console.WriteLine($"UPDATE SAVE {path}");

        var save = SaveByPath.ContainsKey(path)
            ? SaveByPath[path]
            : SaveUtil.GetVariantSAV(path);

        if (save == null)
        {
            DeleteSaveFromPath(path);
            return true;
        }

        SaveById.TryGetValue(save.ID32, out var existingSave);
        if (existingSave != default)
        {
            // Console.WriteLine($"Multiple existing saves with ID {save.ID32}");
            var lastWriteTime = File.GetLastWriteTime(path);
            bool modifiedRecently = (DateTime.Now - lastWriteTime).TotalSeconds <= TIMER_INTERVAL;
            if (!modifiedRecently)
            {
                return false;
            }
        }

        UpdateGlobalsWithSave(save, path);

        Console.WriteLine($"Save {save.ID32} - G{save.Generation} - Version {save.Version} - play-time {save.PlayTimeString}");

        return true;
    }

    private static void UpdateGlobalsWithSave(SaveFile save, string path)
    {
        SaveByPath[path] = save;
        SaveById[save.ID32] = save;

        DexService.UpdateDexWithSave(save);
    }

    private static void DeleteSaveFromPath(string path)
    {
        Console.WriteLine($"DELETE SAVE {path}");

        SaveByPath.TryGetValue(path, out var save);
        if (save != default)
        {
            SaveById.TryGetValue(save.ID32, out var otherSave);
            if (otherSave == save)
            {
                SaveById.Remove(save.ID32);
            }

            DexService.DeleteDexWithSave(save);

            File.Delete(path);
        }

        SaveByPath.Remove(path);
    }

    private static void DeleteBackup(uint saveId, DateTime backupTime)
    {
        var bkpFilePath = GetBackupPath(saveId, backupTime);

        Console.WriteLine($"DELETE BACKUP {bkpFilePath}");

        if (!File.Exists(bkpFilePath))
        {
            throw new Exception($"Backup does not exist: {bkpFilePath}");
        }

        File.Delete(bkpFilePath);
    }

    public static void DeleteSaveFromId(uint saveId, DateTime? backupTime)
    {
        if (backupTime != default)
        {
            DeleteBackup(saveId, (DateTime)backupTime!);
        }
        else
        {
            var path = SaveByPath.Keys.ToList().Find(key => SaveByPath[key].ID32 == saveId);
            DeleteSaveFromPath(path!);

            StorageService.ResetDataLoader();
        }

        WarningsService.CheckWarnings();
    }

    private static string GetBackupPath(uint saveId, DateTime backupTime)
    {
        var mainSavePath = SaveByPath.Keys.ToList().Find(key => SaveByPath[key].ID32 == saveId);

        var fileName = Path.GetFileNameWithoutExtension(mainSavePath);
        var ext = Path.GetExtension(mainSavePath);

        var dirPath = Path.GetDirectoryName(mainSavePath)!;

        var backupTimeStr = backupTime.ToString("o");

        var bkpDirPath = Path.Combine(dirPath, Settings.backupDir);
        var bkpFileName = $"{fileName}_{backupTimeStr}{ext}";
        var bkpFilePath = Path.Combine(bkpDirPath, bkpFileName);

        return bkpFilePath;
    }

    public static Dictionary<uint, List<SaveInfosDTO>> GetAllSaveInfos()
    {
        var record = new Dictionary<uint, List<SaveInfosDTO>>();

        SaveByPath.Keys.ToList().ForEach(mainPath =>
        {
            var mainSave = SaveByPath[mainPath];
            var mainSaveLastWriteTime = File.GetLastWriteTime(mainPath);

            var dtoList = new List<SaveInfosDTO>()
            {
                SaveInfosDTO.FromSave(mainSave, false, null, mainSaveLastWriteTime)
            };

            var fileName = Path.GetFileNameWithoutExtension(mainPath);
            var ext = Path.GetExtension(mainPath);

            var dirPath = Path.GetDirectoryName(mainPath)!;

            var bkpDirPath = Path.Combine(dirPath, Settings.backupDir);
            var bkpFileName = $"{fileName}_*{ext}";
            var bkpFilePath = Path.Combine(bkpDirPath, bkpFileName);

            var matcher = new Matcher();
            matcher.AddInclude(bkpFilePath);
            var matches = matcher.Execute(new DirectoryInfoWrapper(new DirectoryInfo(Settings.rootDir)));

            var bkpPaths = matches.Files.Select(file => Path.Combine(Settings.rootDir, file.Path)).ToList();
            bkpPaths.Sort();
            bkpPaths.Reverse();

            bkpPaths.ForEach(path =>
            {
                var save = SaveUtil.GetVariantSAV(path);
                var saveLastWriteTime = File.GetLastWriteTime(path);

                var backupTimeStr = Path.GetFileNameWithoutExtension(path).Split("_").Last();
                // Console.WriteLine(backupTimeStr);
                var backupTime = DateTime.Parse(backupTimeStr);

                // Console.WriteLine(backupTime);

                dtoList.Add(
                    SaveInfosDTO.FromSave(save, true, backupTime, saveLastWriteTime)
                );
            });

            record.Add(mainSave.ID32, dtoList);
        });

        return record;
    }

    public static SaveFile GetSaveFromId(uint saveId)
    {
        var path = SaveByPath.Keys.ToList().Find(path => SaveByPath[path].ID32 == saveId);
        return SaveUtil.GetVariantSAV(path);
    }

    public static DateTime WriteSaveWithBackup(SaveFile save)
    {
        var path = SaveByPath.Keys.ToList().Find(path => SaveByPath[path].ID32 == save.ID32);
        if (path == default)
        {
            throw new Exception($"Path not found for given save {save.ID32}");
        }

        var fileName = Path.GetFileNameWithoutExtension(path);
        var ext = Path.GetExtension(path);

        var dirPath = Path.GetDirectoryName(path)!;

        var bkpDirPath = Path.Combine(dirPath, Settings.backupDir);

        if (!Directory.Exists(bkpDirPath))
        {
            Directory.CreateDirectory(bkpDirPath);
        }

        var backupTimeStr = DateTime.UtcNow.ToString("o");

        var bkpFileName = $"{fileName}_{backupTimeStr}{ext}";
        var bkpFilePath = Path.Combine(bkpDirPath, bkpFileName);

        File.Copy(path, bkpFilePath);

        File.WriteAllBytes(path, save.Write());

        UpdateGlobalsWithSave(save, path);

        Console.WriteLine($"Writed {save.ID32} to {path}");

        var lastWriteTime = File.GetLastWriteTime(path);

        return lastWriteTime;
    }

    public static SaveInfosDTO UploadNewSave(byte[] fileBytes, string formFilename)
    {
        if (!StorageService.HasEmptyActionList())
        {
            throw new Exception("Storage has waiting actions");
        }

        var save = SaveUtil.GetVariantSAV(fileBytes, formFilename)!;

        var lastWriteTime = WriteSaveWithBackup(save);

        StorageService.ResetDataLoader();

        WarningsService.CheckWarnings();

        return SaveInfosDTO.FromSave(save, false, null, lastWriteTime);
    }

    public static void RestoreBackup(uint saveId, DateTime backupTime)
    {
        var bkpPath = GetBackupPath(saveId, backupTime);
        var bkpSave = SaveUtil.GetVariantSAV(bkpPath);

        WriteSaveWithBackup(bkpSave);

        StorageService.ResetDataLoader();

        WarningsService.CheckWarnings();
    }
}
