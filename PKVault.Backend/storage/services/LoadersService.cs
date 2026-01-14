/**
 * Handles data loaders for current session.
 */
public class LoadersService
{
    private readonly SaveService saveService;
    private readonly PkmConvertService pkmConvertService;
    private readonly FileIOService fileIOService;
    private readonly SettingsService settingsService;

    private readonly Locker<(bool maintainData, bool checkSaves), DataEntityLoaders> loadersLocker;

    public LoadersService(
        SaveService _saveService, PkmConvertService _pkmConvertService, FileIOService _fileIOService, SettingsService _settingsService
    )
    {
        saveService = _saveService;
        pkmConvertService = _pkmConvertService;
        fileIOService = _fileIOService;
        settingsService = _settingsService;

        loadersLocker = new("Loaders", (maintainData: true, checkSaves: true), ResetLoaders);
    }

    public async Task<DataEntityLoaders> GetLoaders()
    {
        return await loadersLocker.GetValue();
    }

    private async Task<DataEntityLoaders> ResetLoaders((bool maintainData, bool checkSaves) flags)
    {
        var loaders = await CreateLoaders();

        if (flags.maintainData)
            await AddAction(loaders, new DataNormalizeAction(), null);

        if (flags.checkSaves)
            await CheckSaveToSynchronize(loaders);

        return loaders;
    }

    public async Task<DataEntityLoaders> CreateLoaders()
    {
        var bankLoader = new BankLoader(fileIOService, settingsService);
        var boxLoader = new BoxLoader(fileIOService, settingsService);
        var pkmLoader = new PkmLoader(fileIOService, settingsService);
        var pkmVersionLoader = new PkmVersionLoader(fileIOService, settingsService, pkmLoader);
        var dexLoader = new DexLoader(fileIOService, settingsService);
        var saveLoadersDict = new Dictionary<uint, SaveLoaders>();

        var saveById = await saveService.GetSaveCloneById();
        if (saveById.Count > 0)
        {
            saveById.Values.ToList().ForEach((save) =>
            {
                saveLoadersDict.Add(save.Id, new(
                    Save: save,
                    Boxes: new SaveBoxLoader(save, boxLoader),
                    Pkms: new SavePkmLoader(settingsService, pkmConvertService, save)
                ));
            });
        }

        return new(saveService)
        {
            bankLoader = bankLoader,
            boxLoader = boxLoader,
            pkmLoader = pkmLoader,
            pkmVersionLoader = pkmVersionLoader,
            dexLoader = dexLoader,
            saveLoadersDict = saveLoadersDict,
        };
    }

    public List<DataActionPayload> GetActionPayloadList()
    {
        if (!loadersLocker.Initialized)
            return [];

        var actionPayloadList = new List<DataActionPayload>();

        return [.. loadersLocker.Value!.actions.Select(action => action.payload)];
    }

    public bool HasEmptyActionList()
    {
        return !loadersLocker.Initialized || loadersLocker.Value!.actions.Count == 0;
    }

    public async Task<DataUpdateFlags> AddAction(DataAction action, DataUpdateFlags? flags)
    {
        var loaders = await loadersLocker.GetValue();

        return await AddAction(loaders, action, flags);
    }

    private static async Task<DataUpdateFlags> AddAction(DataEntityLoaders loaders, DataAction action, DataUpdateFlags? flags)
    {
        try
        {
            var flags2 = flags ?? new();
            await ApplyAction(loaders, action, flags2);
            // add to action-list only if action did something
            // (made for first action only)
            if (loaders.GetHasWritten())
            {
                loaders.actions.Add(action);
            }
            return flags2;
        }
        catch
        {
            loaders.actions.Remove(action);
            throw;
        }
    }

    private static async Task ApplyAction(DataEntityLoaders loaders, DataAction action, DataUpdateFlags flags)
    {
        var logtime = LogUtil.Time($"Apply action - {action.GetType()}");

        loaders.SetFlags(flags);

        await action.ExecuteWithPayload(loaders, flags);

        logtime();
    }

    private async Task CheckSaveToSynchronize(DataEntityLoaders loaders)
    {
        (string PkmId, string SavePkmId)[][] synchronizationData = await SynchronizePkmAction.GetSavesPkmsToSynchronize(loaders);

        foreach (var data in synchronizationData)
        {
            if (data.Length > 0)
            {
                await AddAction(
                    loaders,
                    new SynchronizePkmAction(pkmConvertService, data),
                    null
                );
            }
        }
    }

    public void InvalidateLoaders((bool maintainData, bool checkSaves) flags)
    {
        loadersLocker.Invalidate(flags);
    }

    public async Task EnsureInitialized()
    {
        await loadersLocker.GetValue();
    }
}
