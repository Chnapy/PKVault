using System.Collections.Concurrent;
using PKHeX.Core;

public interface ISavesLoadersService
{
    public SaveLoadersRecord[] GetAllLoaders();
    public SaveLoadersRecord? GetLoaders(uint saveId);

    public IDictionary<uint, SaveWrapper> GetSaveById();
    public IDictionary<uint, HashSet<string>> GetSavePaths();
    public IDictionary<uint, SaveInfosDTO> GetAllSaveInfos();

    public void SetFlags(DataUpdateFlags flags);
    public Task WriteToFiles();

    public void Clear();
    public Task Setup();
}

public class SavesLoadersService(
    IServiceProvider sp,
    ILogger<SavesLoadersService> log,
    IFileIOService fileIOService,
    ISettingsService settingsService,
    IPkmConvertService pkmConvertService,
    StaticDataService staticDataService
) : ISavesLoadersService
{
    private IDictionary<uint, SaveLoadersRecord> Loaders = new Dictionary<uint, SaveLoadersRecord>();
    private IDictionary<uint, HashSet<string>> SavePaths = new Dictionary<uint, HashSet<string>>();
    private bool Initialized = false;

    public SaveLoadersRecord[] GetAllLoaders()
    {
        if (!Initialized)
        {
            throw new Exception("Save loaders not initialized");
        }

        return [.. Loaders.Values];
    }

    public SaveLoadersRecord? GetLoaders(uint saveId)
    {
        if (!Initialized)
        {
            throw new Exception("Save loaders not initialized");
        }

        if (!Loaders.TryGetValue(saveId, out var loaders))
        {
            return null;
        }
        return loaders;
    }

    public IDictionary<uint, SaveWrapper> GetSaveById()
    {
        if (!Initialized)
        {
            throw new Exception("Save loaders not initialized");
        }

        return Loaders.Values.ToDictionary(
            p => p.Save.Id,
            p => p.Save
        );
    }

    public IDictionary<uint, HashSet<string>> GetSavePaths()
    {
        if (!Initialized)
        {
            throw new Exception("Save loaders not initialized");
        }

        return SavePaths.ToDictionary();
    }

    public IDictionary<uint, SaveInfosDTO> GetAllSaveInfos()
    {
        if (!Initialized)
        {
            throw new Exception("Save loaders not initialized");
        }

        var record = new Dictionary<uint, SaveInfosDTO>();

        Loaders.Values.ToList().ForEach(loader =>
        {
            var mainSave = loader.Save;
            ArgumentException.ThrowIfNullOrWhiteSpace(mainSave.Metadata.FilePath);
            var mainSaveLastWriteTime = fileIOService.GetLastWriteTime(mainSave.Metadata.FilePath);

            record.TryAdd(mainSave.Id, SaveInfosDTO.FromSave(mainSave, mainSaveLastWriteTime));
        });

        return record;
    }

    public void SetFlags(DataUpdateFlags flags)
    {
        if (!Initialized)
        {
            throw new Exception("Save loaders not initialized");
        }

        Loaders.Values.ToList().ForEach(saveLoader =>
        {
            saveLoader.Pkms.SetFlags(flags.Saves, flags.Dex);
        });
    }

    public async Task WriteToFiles()
    {
        using var _ = log.Time($"SavesLoadersService.WriteToFiles");

        List<Task> tasks = [];

        foreach (var loaders in Loaders.Values.ToList())
        {
            if (loaders.Pkms.HasWritten || loaders.Boxes.HasWritten)
            {
                tasks.Add(
                    WriteSave(loaders.Save)
                );
            }
        }

        await Task.WhenAll(tasks);
    }

    private async Task WriteSave(SaveWrapper save)
    {
        var path = save.Metadata.FilePath;
        ArgumentException.ThrowIfNullOrWhiteSpace(path);
        await fileIOService.WriteBytes(path, save.GetSaveFileData());

        var evolves = await staticDataService.GetStaticEvolves();

        UpdateGlobalsWithSave(Loaders, SavePaths, save, path, evolves);

        log.LogInformation($"Writed save {save.Id} to {path}");
    }

    public void Clear()
    {
        Initialized = false;
        Loaders.Clear();
        SavePaths.Clear();
    }

    public async Task Setup()
    {
        Clear();

        var (loaders, savePaths) = await ReadSaveFiles();

        Loaders = loaders;
        SavePaths = savePaths;
        Initialized = true;

        var memoryUsedMB = System.Diagnostics.Process.GetCurrentProcess().WorkingSet64 / 1_000_000;

        log.LogDebug($"(timed check done - memory used: {memoryUsedMB} MB)");
    }

    private async Task<(
        IDictionary<uint, SaveLoadersRecord> loaders,
        IDictionary<uint, HashSet<string>> savePaths
    )> ReadSaveFiles()
    {
        ConcurrentDictionary<uint, SaveLoadersRecord> loaders = [];
        ConcurrentDictionary<uint, HashSet<string>> savePaths = [];

        var globs = settingsService.GetSettings().SettingsMutable.SAVE_GLOBS;
        var searchPaths = fileIOService.Matcher.SearchPaths(globs);

        var evolves = await staticDataService.GetStaticEvolves();

        await Task.WhenAll(
            searchPaths.Select(path => UpdateSaveFromPath(loaders, savePaths, path, evolves))
        );

        return (loaders, savePaths);
    }

    private async Task UpdateSaveFromPath(
        IDictionary<uint, SaveLoadersRecord> loaders,
        IDictionary<uint, HashSet<string>> savePaths,
        string path, StaticEvolvesData evolves)
    {
        // log.LogInformation($"UPDATE SAVE {path}");

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
            ArgumentException.ThrowIfNullOrWhiteSpace(save.Metadata.FilePath);

            UpdateGlobalsWithSave(loaders, savePaths, save, path, evolves);

            log.LogDebug($"Save {save.Id} {save.Id} {save.Id} - G{save.Generation} - Version {save.Version} - play-time {save.PlayTimeString}");
        }
        catch (Exception ex)
        {
            log.LogError(ex.ToString());
        }
    }

    private void UpdateGlobalsWithSave(
        IDictionary<uint, SaveLoadersRecord> loaders,
        IDictionary<uint, HashSet<string>> savePaths,
        SaveWrapper save, string path, StaticEvolvesData evolves
    )
    {
        if (!savePaths.TryGetValue(save.Id, out var paths))
        {
            paths = [];
            savePaths.Add(save.Id, paths);
        }
        paths.Add(path);

        var language = settingsService.GetSettings().GetSafeLanguage();

        var boxLoader = new SaveBoxLoader(save, sp);
        var pkmLoader = new SavePkmLoader(log, pkmConvertService, language, evolves, save);

        loaders[save.Id] = new(save, boxLoader, pkmLoader);
    }
}

public record SaveLoadersRecord(
    SaveWrapper Save,
    ISaveBoxLoader Boxes,
    ISavePkmLoader Pkms
);
