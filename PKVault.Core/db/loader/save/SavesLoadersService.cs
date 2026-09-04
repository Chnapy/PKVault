using System.Collections.Concurrent;
using PKHeX.Core;
using Serilog;

public interface ISavesLoadersService
{
    public SaveLoadersRecord[] GetAllLoaders();
    public SaveLoadersRecord? GetLoaders(uint saveId);

    public IDictionary<uint, SaveWrapper> GetSaveById();
    public IDictionary<uint, SaveInfosDTO> GetAllSaveInfos();

    public void SetFlags(DataUpdateFlags flags);
    public Task WriteToFiles();

    public void Clear();
    public Task Setup(DataUpdateFlags flags);

    public Task<SaveWrapper> CheckSaveData(byte[] fileBytes, string filename, bool overwrite);
    public Task UploadSaveWithoutCheck(string savePath, byte[] fileBytes);
    public bool DeleteSave(string path, DataUpdateFlags flags);
}

public class SavesLoadersService(
    IServiceProvider sp,
    IFileIOService fileIOService,
    ISettingsService settingsService,
    IPkmConvertService pkmConvertService,
    StaticDataService staticDataService
) : ISavesLoadersService
{
    private IDictionary<uint, SaveLoadersRecord> Loaders = new Dictionary<uint, SaveLoadersRecord>();
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

    public IDictionary<uint, SaveInfosDTO> GetAllSaveInfos()
    {
        if (!Initialized)
        {
            throw new Exception("Save loaders not initialized");
        }

        var saveVersionOverrides = settingsService.GetSettings().SettingsMutable.SAVE_VERSION_OVERRIDES ?? [];

        var record = new Dictionary<uint, SaveInfosDTO>();

        foreach (var loader in Loaders.Values)
        {
            var mainSave = loader.Save;
            ArgumentException.ThrowIfNullOrWhiteSpace(mainSave.Metadata.FilePath);
            var mainSaveLastWriteTime = fileIOService.GetLastWriteTime(mainSave.Metadata.FilePath);

            GameVersion? displayedVersion = saveVersionOverrides.TryGetValue(mainSave.Id, out var v) ? v : null;

            record.TryAdd(mainSave.Id, SaveInfosDTO.FromSave(mainSave, displayedVersion, mainSaveLastWriteTime, loader.Duplicates));
        }

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
        using var _ = Log.Logger.Time($"SavesLoadersService.WriteToFiles");

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

        SimpleUpdateLoadersWithSave(Loaders, save, evolves);

        Log.Information($"Writed save {save.Id} to {path}");
    }

    public void Clear()
    {
        Initialized = false;
        Loaders.Clear();
    }

    public async Task Setup(DataUpdateFlags flags)
    {
        Clear();

        Loaders = await ReadSaveFiles();
        Initialized = true;

        flags.SaveInfos = true;
        flags.Saves.All = true;

        var memoryUsedMB = System.Diagnostics.Process.GetCurrentProcess().WorkingSet64 / 1_000_000;

        Log.Debug($"(timed check done - memory used: {memoryUsedMB} MB)");
    }

    private async Task<IDictionary<uint, SaveLoadersRecord>> ReadSaveFiles()
    {
        ConcurrentDictionary<uint, SaveLoadersRecord> loaders = [];

        var settings = settingsService.GetSettings();

        string[] globs = [
            settings.SavesUploadsPath,
            ..settings.SettingsMutable.SAVE_GLOBS
        ];
        var searchPaths = fileIOService.Matcher.SearchPaths(globs);

        var evolves = await staticDataService.GetStaticEvolves();

        var pathsSaves = await Task.WhenAll(
            searchPaths.Select(async path => (Path: path, Save: await LoadSaveFromPath(path)))
        );

        // remove non-existing paths from path-overrides to simplify next steps
        // no persistence here
        var savePathOverrides = settings.SettingsMutable.SAVE_PATH_OVERRIDES?.Where(saveFile =>
            pathsSaves.Any(ps => ps.Save?.Id == saveFile.Key && ps.Save.Metadata.FilePath == saveFile.Value)
        ).ToDictionary() ?? [];

        foreach (var (Path, Save) in pathsSaves)
        {
            if (Save != null)
                UpdateGlobalsWithSave(loaders, Save, evolves, savePathOverrides);
        }

        return loaders;
    }

    private async Task<SaveWrapper?> LoadSaveFromPath(string path)
    {
        try
        {
            var (TooSmall, TooBig) = fileIOService.CheckGameFile(path);
            if (TooSmall || TooBig)
            {
                return null;
            }

            var data = await fileIOService.ReadBytes(path);
            return await GetSaveFile(data, path);
        }
        catch (Exception ex)
        {
            Log.Error(ex, $"Exception during save load by path, path={path}");
            return null;
        }
    }

    private async Task<SaveWrapper?> GetSaveFile(byte[] data, string path)
    {
        try
        {
            var (TooSmall, TooBig) = fileIOService.CheckGameFile(data.Length);
            if (TooSmall || TooBig)
            {
                return null;
            }

            if (!SaveUtil.TryGetSaveFile((byte[])data.Clone(), out var saveRaw))
                return null;

            saveRaw.Metadata.SetExtraInfo(path);
            if (saveRaw.Generation <= 3)
                SaveLanguage.TryRevise(saveRaw);

            SaveWrapper save = new(saveRaw);
            ArgumentException.ThrowIfNullOrWhiteSpace(save.Metadata.FilePath);

            Log.Debug($"Save {save.Id} - G{save.Generation} - Version {save.Version} - play-time {save.PlayTimeString}");

            return save;
        }
        catch (Exception ex)
        {
            Log.Error(ex, $"Exception during save load, path={path}");
            return null;
        }
    }

    private void UpdateGlobalsWithSave(
        IDictionary<uint, SaveLoadersRecord> loaders,
        SaveWrapper save, StaticEvolvesData evolves, Dictionary<uint, string> savePathOverrides
    )
    {
        var settings = settingsService.GetSettings();

        var saveVersionOverrides = settings.SettingsMutable.SAVE_VERSION_OVERRIDES ?? [];
        GameVersion? displayedVersion = saveVersionOverrides.TryGetValue(save.Id, out var v) ? v : null;

        // add save if one with same ID not already present
        if (!loaders.TryGetValue(save.Id, out var existingSaveRecord))
        {
            SimpleUpdateLoadersWithSave(loaders, save, evolves, []);
        }
        // replace existing if has bigger PlayTime OR if has path selected by user
        else if (savePathOverrides.TryGetValue(save.Id, out var pathOverride)
            ? pathOverride == save.Metadata.FilePath
            : save.PlayTimeInSeconds > existingSaveRecord.Save.PlayTimeInSeconds
        )
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(existingSaveRecord.Save.Metadata.FilePath);
            var existingSaveLastWriteTime = fileIOService.GetLastWriteTime(existingSaveRecord.Save.Metadata.FilePath);

            SimpleUpdateLoadersWithSave(loaders, save, evolves, [
                ..existingSaveRecord.Duplicates,
                SaveInfosDTO.FromSave(existingSaveRecord.Save, displayedVersion, existingSaveLastWriteTime, []),
            ]);
        }
        // ignore save, add it to duplicates
        else
        {
            ArgumentException.ThrowIfNullOrWhiteSpace(save.Metadata.FilePath);
            var saveLastWriteTime = fileIOService.GetLastWriteTime(save.Metadata.FilePath);

            loaders[save.Id] = existingSaveRecord with
            {
                Duplicates = [
                    ..existingSaveRecord?.Duplicates ?? [],
                    SaveInfosDTO.FromSave(save, displayedVersion, saveLastWriteTime, []),
                ],
            };
        }
    }

    private void SimpleUpdateLoadersWithSave(
        IDictionary<uint, SaveLoadersRecord> loaders,
        SaveWrapper save, StaticEvolvesData evolves,
        SaveInfosDTO[]? duplicates = null
    )
    {
        var settings = settingsService.GetSettings();
        var language = settings.GetLanguageForPKHeX();

        var boxLoader = new SaveBoxLoader(save, sp);
        var pkmLoader = new SavePkmLoader(pkmConvertService, language, evolves, save);

        duplicates ??= loaders.TryGetValue(save.Id, out var existingSave)
            ? existingSave.Duplicates
            : [];

        loaders[save.Id] = new(save, boxLoader, pkmLoader, duplicates);
    }

    public async Task<SaveWrapper> CheckSaveData(byte[] fileBytes, string filename, bool overwrite)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(filename);

        var savesUploadsPath = settingsService.GetSettings().SavesUploadsPath;

        var savePath = Path.Combine(savesUploadsPath, filename);

        if (!overwrite && fileIOService.Exists(savePath))
        {
            throw new ArgumentException($"File already exists: {savePath}");
        }

        var save = await GetSaveFile(fileBytes, savePath);
        ArgumentNullException.ThrowIfNull(save, $"Cannot create save from given file: {filename}");

        return save;
    }

    public async Task UploadSaveWithoutCheck(string savePath, byte[] fileBytes)
    {
        await fileIOService.WriteBytes(savePath, fileBytes);
    }

    public bool DeleteSave(string path, DataUpdateFlags flags)
    {
        var allSaveInfos = GetAllSaveInfos().Values.SelectMany<SaveInfosDTO, SaveInfosDTO>(dto => [dto, .. dto.Duplicates]);
        var saveInfos = allSaveInfos.FirstOrDefault(
            s => s?.Path == path,
            null
        );
        if (saveInfos == null)
            return false;

        if (!fileIOService.Delete(saveInfos.Path))
            return false;

        flags.SaveInfos = true;
        flags.Saves.UseSave(saveInfos.Id).SavePkms.All = true;
        flags.Saves.UseSave(saveInfos.Id).SaveBoxes = true;
        flags.Dex.All = true;

        return true;
    }
}

public record SaveLoadersRecord(
    SaveWrapper Save,
    ISaveBoxLoader Boxes,
    ISavePkmLoader Pkms,
    SaveInfosDTO[] Duplicates
);
