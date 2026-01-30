using System.Collections.Concurrent;
using PKHeX.Core;

public interface ISaveService
{
    public Task<Dictionary<uint, SaveWrapper>> GetSaveCloneById();
    public Task<Dictionary<uint, SaveWrapper>> GetSaveById();
    public Task<Dictionary<string, SaveWrapper>> GetSaveByPath();
    public Task<Dictionary<uint, SaveInfosDTO>> GetAllSaveInfos();
    public Task WriteSave(SaveWrapper save);
    public void InvalidateSaves();
    public Task EnsureInitialized();
}

/**
 * Saves files reading and writing.
 */
public class SaveService : ISaveService
{
    private IFileIOService fileIOService;
    private ISettingsService settingsService;
    private readonly Locker<
        bool,
        (ConcurrentDictionary<uint, SaveWrapper> SaveById, ConcurrentDictionary<string, SaveWrapper> SaveByPath)
    > savesLocker;

    public SaveService(IFileIOService _fileIOService, ISettingsService _settingsService)
    {
        fileIOService = _fileIOService;
        settingsService = _settingsService;
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
            var mainSaveLastWriteTime = fileIOService.GetLastWriteTime(mainPath);

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

        await fileIOService.WriteBytes(path, save.GetSaveFileData());

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

        var globs = settingsService.GetSettings().SettingsMutable.SAVE_GLOBS;
        var searchPaths = MatcherUtil.SearchPaths(globs);

        await Task.WhenAll(
            searchPaths.Select(path => UpdateSaveFromPath(SaveById, SaveByPath, path))
        );

        var memoryUsedMB = System.Diagnostics.Process.GetCurrentProcess().WorkingSet64 / 1_000_000;

        Console.WriteLine($"(timed check done - memory used: {memoryUsedMB} MB)");

        return (SaveById, SaveByPath);
    }

    private async Task UpdateSaveFromPath(
        ConcurrentDictionary<uint, SaveWrapper> SaveById,
        ConcurrentDictionary<string, SaveWrapper> SaveByPath,
        string path)
    {
        // Console.WriteLine($"UPDATE SAVE {path}");

        try
        {
            var (TooSmall, TooBig) = fileIOService.CheckGameFile(path);
            if (TooSmall || TooBig)
            {
                return;
            }

            var data = await fileIOService.ReadBytes(path);
            if (!SaveUtil.TryGetSaveFile(data, out var saveRaw, path))
                return;

            saveRaw.Metadata.SetExtraInfo(path);
            if (saveRaw.Generation <= 3)
                SaveLanguage.TryRevise(saveRaw);

            SaveWrapper save = new(saveRaw);

            UpdateGlobalsWithSave(SaveById, SaveByPath, save, path);

            Console.WriteLine($"Save {save.Id} {save.Id} {save.Id} - G{save.Generation} - Version {save.Version} - play-time {save.PlayTimeString}");
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine(ex);
        }
    }

    private void UpdateGlobalsWithSave(
        ConcurrentDictionary<uint, SaveWrapper> SaveById,
        ConcurrentDictionary<string, SaveWrapper> SaveByPath,
        SaveWrapper save, string path)
    {
        SaveByPath[path] = save;
        SaveById[save.Id] = save;
    }
}
