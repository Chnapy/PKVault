using System.Collections.Concurrent;
using PKHeX.Core;

/**
 * Saves files reading and writing.
 */
public class SaveService
{
    private readonly Locker<
        bool,
        (ConcurrentDictionary<uint, SaveWrapper> SaveById, ConcurrentDictionary<string, SaveWrapper> SaveByPath)
    > savesLocker;

    public SaveService()
    {
        savesLocker = new("Saves", true, ReadLocalSaves);
    }

    public async Task<Dictionary<uint, SaveWrapper>> GetSaveCloneById()
    {
        var (SaveById, _) = await savesLocker.GetValue();
        return SaveById
          .Select(entry => (entry.Key, entry.Value.Clone()))
          .ToDictionary();
    }

    public async Task<Dictionary<uint, SaveWrapper>> GetSaveById()
    {
        var (SaveById, _) = await savesLocker.GetValue();
        return SaveById.ToDictionary();
    }

    public async Task<Dictionary<string, SaveWrapper>> GetSaveByPath()
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

            record.TryAdd(mainSave.Id, SaveInfosDTO.FromSave(mainSave, mainSaveLastWriteTime));
        });

        return record;
    }

    public async Task WriteSave(SaveWrapper save)
    {
        var (SaveById, SaveByPath) = await savesLocker.GetValue();
        var path = SaveByPath.Keys.ToList().Find(path => SaveByPath[path].Id == save.Id);
        if (path == default)
        {
            throw new KeyNotFoundException($"Path not found for given save {save.Id}");
        }

        var fileName = Path.GetFileNameWithoutExtension(path);
        var ext = Path.GetExtension(path);

        var dirPath = Path.GetDirectoryName(path)!;

        File.WriteAllBytes(path, save.GetSaveFileData());

        UpdateGlobalsWithSave(SaveById, SaveByPath, save, path);

        Console.WriteLine($"Writed save {save.Id} to {path}");
    }

    public void InvalidateSaves()
    {
        savesLocker.Invalidate(true);
    }

    public async Task EnsureInitialized()
    {
        await savesLocker.GetValue();
    }

    private async Task<(ConcurrentDictionary<uint, SaveWrapper> SaveById, ConcurrentDictionary<string, SaveWrapper> SaveByPath)> ReadLocalSaves(bool _)
    {
        ConcurrentDictionary<uint, SaveWrapper> SaveById = [];
        ConcurrentDictionary<string, SaveWrapper> SaveByPath = [];

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
        ConcurrentDictionary<uint, SaveWrapper> SaveById,
        ConcurrentDictionary<string, SaveWrapper> SaveByPath,
        string path)
    {
        // Console.WriteLine($"UPDATE SAVE {path}");

        SaveWrapper? save = SaveByPath.TryGetValue(path, out var value)
            ? value
            : (SaveUtil.TryGetSaveFile(path, out var result)
                ? new(result, path)
                : null);

        if (save == null)
        {
            return;
        }

        SaveById.TryGetValue(save.Id, out var existingSave);
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

        Console.WriteLine($"Save {save.Id} {save.Id} {save.Id} - G{save.Generation} - Version {save.Version} - play-time {save.PlayTimeString}");
    }

    private void UpdateGlobalsWithSave(
        ConcurrentDictionary<uint, SaveWrapper> SaveById,
        ConcurrentDictionary<string, SaveWrapper> SaveByPath,
        SaveWrapper save, string path)
    {
        SaveByPath[path] = save;
        SaveById[save.Id] = save;
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
