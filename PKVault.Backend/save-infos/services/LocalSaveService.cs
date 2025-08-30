using PKHeX.Core;

public class LocalSaveService
{
    public static Dictionary<uint, SaveFile> SaveById { get; } = [];
    public static Dictionary<string, SaveFile> SaveByPath { get; } = [];

    // private static List<FileSystemWatcher> watchers = [];
    private const int TIMER_INTERVAL = 30;
    private static Timer? Timer;

    public static async Task PrepareTimerAndRun()
    {
        Timer?.Dispose();

        var updated = await ReadLocalSaves();

        Timer = new Timer(async (object? _) =>
        {
            if (StorageService.HasEmptyActionList())
            {
                updated = await ReadLocalSaves();
                if (updated)
                {
                    await WarningsService.CheckWarnings();
                }
            }
        }, null, TimeSpan.FromSeconds(TIMER_INTERVAL), TimeSpan.FromSeconds(TIMER_INTERVAL));
    }

    public static async Task ResetTimerAndData()
    {
        SaveById.Clear();
        SaveByPath.Clear();

        await PrepareTimerAndRun();
    }

    public static async Task<bool> ReadLocalSaves()
    {
        var globs = SettingsService.AppSettings.SAVE_GLOBS;
        var searchPaths = MatcherUtil.SearchPaths(globs);

        var hasBeenUpdated = false;

        foreach (var path in searchPaths)
        {
            var updated = UpdateSaveFromPath(path);
            if (updated)
            {
                hasBeenUpdated = true;
            }
        }

        var memoryUsedMB = System.Diagnostics.Process.GetCurrentProcess().WorkingSet64 / 1_000_000;

        Console.WriteLine($"(timed check done - memory used: {memoryUsedMB} MB)");

        return hasBeenUpdated;
    }

    private static bool UpdateSaveFromPath(string path)
    {
        // Console.WriteLine($"UPDATE SAVE {path}");

        var save = SaveByPath.ContainsKey(path)
            ? SaveByPath[path]
            : SaveUtil.GetVariantSAV(path);

        if (save == null)
        {
            return false;
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

            File.Delete(path);
        }

        SaveByPath.Remove(path);
    }

    public static async Task DeleteSaveFromId(uint saveId)
    {
        if (!StorageService.HasEmptyActionList())
        {
            throw new Exception("Storage has waiting actions");
        }

        await BackupService.PrepareBackupThenRun(async () =>
        {
            var path = SaveByPath.Keys.ToList().Find(key => SaveByPath[key].ID32 == saveId);
            DeleteSaveFromPath(path!);
        });
    }

    public static Dictionary<uint, SaveInfosDTO> GetAllSaveInfos()
    {
        var record = new Dictionary<uint, SaveInfosDTO>();

        SaveByPath.Keys.ToList().ForEach(mainPath =>
        {
            var mainSave = SaveByPath[mainPath];
            var mainSaveLastWriteTime = File.GetLastWriteTime(mainPath);

            record.Add(mainSave.ID32, SaveInfosDTO.FromSave(mainSave, false, null, mainSaveLastWriteTime));
        });

        return record;
    }

    public static SaveFile GetSaveFromId(uint saveId)
    {
        var path = SaveByPath.Keys.ToList().Find(path => SaveByPath[path].ID32 == saveId);
        return SaveUtil.GetVariantSAV(path)!;
    }

    public static DateTime WriteSave(SaveFile save)
    {
        var path = SaveByPath.Keys.ToList().Find(path => SaveByPath[path].ID32 == save.ID32);
        if (path == default)
        {
            throw new Exception($"Path not found for given save {save.ID32}");
        }

        var fileName = Path.GetFileNameWithoutExtension(path);
        var ext = Path.GetExtension(path);

        var dirPath = Path.GetDirectoryName(path)!;

        File.WriteAllBytes(path, save.Write());

        UpdateGlobalsWithSave(save, path);

        Console.WriteLine($"Writed save {save.ID32} to {path}");

        var lastWriteTime = File.GetLastWriteTime(path);

        return lastWriteTime;
    }

    public static async Task UploadNewSave(byte[] fileBytes, string formFilename)
    {
        if (!StorageService.HasEmptyActionList())
        {
            throw new Exception("Storage has waiting actions");
        }

        var save = SaveUtil.GetVariantSAV(fileBytes, formFilename)!;

        await BackupService.PrepareBackupThenRun(async () =>
        {
            WriteSave(save);
        });
    }
}
