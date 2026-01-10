using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text;
using PKHeX.Core;

public class SaveService
{
    public static byte[] GetSaveFileData(SaveFile save) => save.Write().ToArray();

    private readonly Locker<
        bool,
        (ConcurrentDictionary<uint, SaveFile> SaveById, ConcurrentDictionary<string, SaveFile> SaveByPath)
    > savesLocker;

    public SaveService()
    {
        savesLocker = new("Saves", true, ReadLocalSaves);
    }

    public async Task<Dictionary<uint, SaveFile>> GetSaveById()
    {
        var (SaveById, _) = await savesLocker.GetValue();
        return SaveById.ToDictionary();
    }

    public async Task<Dictionary<string, SaveFile>> GetSaveByPath()
    {
        var (_, SaveByPath) = await savesLocker.GetValue();
        return SaveByPath.ToDictionary();
    }

    public async Task<Dictionary<uint, SaveInfosDTO>> GetAllSaveInfos()
    {
        var (_, SaveByPath) = await savesLocker.GetValue();
        var record = new Dictionary<uint, SaveInfosDTO>();

        SaveByPath.Keys.ToList().ForEach(mainPath =>
        {
            var mainSave = SaveByPath[mainPath];
            var mainSaveLastWriteTime = File.GetLastWriteTime(mainPath);

            record.TryAdd(mainSave.ID32, SaveInfosDTO.FromSave(mainSave, mainSaveLastWriteTime));
        });

        return record;
    }

    public async Task WriteSave(SaveFile save)
    {
        var (SaveById, SaveByPath) = await savesLocker.GetValue();
        var path = SaveByPath.Keys.ToList().Find(path => SaveByPath[path].ID32 == save.ID32);
        if (path == default)
        {
            throw new KeyNotFoundException($"Path not found for given save {save.ID32}");
        }

        var fileName = Path.GetFileNameWithoutExtension(path);
        var ext = Path.GetExtension(path);

        var dirPath = Path.GetDirectoryName(path)!;

        File.WriteAllBytes(path, GetSaveFileData(save));

        UpdateGlobalsWithSave(SaveById, SaveByPath, save, path);

        Console.WriteLine($"Writed save {save.ID32} to {path}");
    }

    public void InvalidateSaves()
    {
        savesLocker.Invalidate(true);
    }

    public async Task EnsureInitialized()
    {
        await savesLocker.GetValue();
    }

    private async Task<(ConcurrentDictionary<uint, SaveFile> SaveById, ConcurrentDictionary<string, SaveFile> SaveByPath)> ReadLocalSaves(bool _)
    {
        ConcurrentDictionary<uint, SaveFile> SaveById = [];
        ConcurrentDictionary<string, SaveFile> SaveByPath = [];

        var globs = SettingsService.BaseSettings.SettingsMutable.SAVE_GLOBS;
        var searchPaths = MatcherUtil.SearchPaths(globs);

        await Task.WhenAll(
            searchPaths.Select(path => Task.Run(() => UpdateSaveFromPath(SaveById, SaveByPath, path)))
        );

        var memoryUsedMB = System.Diagnostics.Process.GetCurrentProcess().WorkingSet64 / 1_000_000;

        Console.WriteLine($"(timed check done - memory used: {memoryUsedMB} MB)");

        return (SaveById, SaveByPath);
    }

    private void UpdateSaveFromPath(
        ConcurrentDictionary<uint, SaveFile> SaveById,
        ConcurrentDictionary<string, SaveFile> SaveByPath,
        string path)
    {
        // Console.WriteLine($"UPDATE SAVE {path}");

        var save = SaveByPath.TryGetValue(path, out var value) ? value
        : (SaveUtil.TryGetSaveFile(path, out var result) ? result : null);

        if (save == null)
        {
            return;
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

        UpdateGlobalsWithSave(SaveById, SaveByPath, save, path);

        Console.WriteLine($"Save {save.ID32} - G{save.Generation} - Version {save.Version} - play-time {save.PlayTimeString}");
    }

    private void UpdateGlobalsWithSave(
        ConcurrentDictionary<uint, SaveFile> SaveById,
        ConcurrentDictionary<string, SaveFile> SaveByPath,
        SaveFile save, string path)
    {
        SaveByPath[path] = save;
        SaveById[save.ID32] = save;
    }

    // public async Task<DataUpdateFlags> UploadNewSave(byte[] fileBytes, string formFilename)
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
