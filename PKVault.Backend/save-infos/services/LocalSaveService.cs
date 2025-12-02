using System.Security.Cryptography;
using System.Text;
using PKHeX.Core;

public class LocalSaveService
{
    public static Dictionary<uint, SaveFile> SaveById { get; } = [];
    public static Dictionary<string, SaveFile> SaveByPath { get; } = [];

    public static bool ReadLocalSaves()
    {
        SaveById.Clear();
        SaveByPath.Clear();

        var globs = SettingsService.AppSettings.SettingsMutable.SAVE_GLOBS;
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

        var save = SaveByPath.TryGetValue(path, out var value) ? value
        : (SaveUtil.TryGetSaveFile(path, out var result) ? result : null);

        if (save == null)
        {
            return false;
        }

        if (save.ID32 == default)
        {
            byte[] bytes = Encoding.UTF8.GetBytes(path);
            byte[] hash = SHA1.HashData(bytes);
            var saveId = BitConverter.ToUInt32(hash, 0);
            save.ID32 = saveId;
        }

        SaveById.TryGetValue(save.ID32, out var existingSave);
        if (existingSave != default)
        {
            // Console.WriteLine($"Multiple existing saves with ID {save.ID32}");
            // var lastWriteTime = File.GetLastWriteTime(path);
            // bool modifiedRecently = (DateTime.Now - lastWriteTime).TotalSeconds <= TIMER_INTERVAL;
            // if (!modifiedRecently)
            // {
            //     return false;
            // }
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

    public static async Task<DataUpdateFlags> DeleteSaveFromId(uint saveId)
    {
        if (!StorageService.HasEmptyActionList())
        {
            throw new InvalidOperationException("Storage has waiting actions");
        }

        var flags = new DataUpdateFlags();

        await BackupService.PrepareBackupThenRun(async () =>
        {
            var path = SaveByPath.Keys.ToList().Find(key => SaveByPath[key].ID32 == saveId);
            DeleteSaveFromPath(path!);
        });

        flags.Saves.Add(new()
        {
            SaveId = saveId,
            SaveBoxes = true,
            SavePkms = true
        });
        flags.Dex = true;
        flags.SaveInfos = true;
        flags.Backups = true;
        flags.Warnings = true;

        return flags;
    }

    public static Dictionary<uint, SaveInfosDTO> GetAllSaveInfos()
    {
        var record = new Dictionary<uint, SaveInfosDTO>();

        SaveByPath.Keys.ToList().ForEach(mainPath =>
        {
            var mainSave = SaveByPath[mainPath];
            var mainSaveLastWriteTime = File.GetLastWriteTime(mainPath);

            record.TryAdd(mainSave.ID32, SaveInfosDTO.FromSave(mainSave, mainSaveLastWriteTime));
        });

        return record;
    }

    public static void WriteSave(SaveFile save)
    {
        var path = SaveByPath.Keys.ToList().Find(path => SaveByPath[path].ID32 == save.ID32);
        if (path == default)
        {
            throw new KeyNotFoundException($"Path not found for given save {save.ID32}");
        }

        var fileName = Path.GetFileNameWithoutExtension(path);
        var ext = Path.GetExtension(path);

        var dirPath = Path.GetDirectoryName(path)!;

        File.WriteAllBytes(path, GetSaveFileData(save));

        UpdateGlobalsWithSave(save, path);

        Console.WriteLine($"Writed save {save.ID32} to {path}");
    }

    public static byte[] GetSaveFileData(SaveFile save) => save.Write().ToArray();

    // public static async Task<DataUpdateFlags> UploadNewSave(byte[] fileBytes, string formFilename)
    // {
    //     if (!StorageService.HasEmptyActionList())
    //     {
    //         throw new Exception("Storage has waiting actions");
    //     }

    //     var flags = new DataUpdateFlags();

    //     var save = SaveUtil.GetVariantSAV(fileBytes, formFilename)!;

    //     await BackupService.PrepareBackupThenRun(async () =>
    //     {
    //         WriteSave(save);
    //     });

    //     flags.Saves.Add(new()
    //     {
    //         SaveId = save.ID32,
    //         SaveBoxes = true,
    //         SavePkms = true
    //     });
    //     flags.SaveInfos = true;
    //     flags.Backups = true;

    //     return flags;
    // }
}
