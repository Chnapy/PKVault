public class LoadersService
{
    private readonly SaveService saveService;
    private readonly PkmConvertService pkmConvertService;

    private readonly Locker<(bool maintainData, bool checkSaves), DataEntityLoaders> loadersLocker;

    public LoadersService(SaveService _saveService, PkmConvertService _pkmConvertService)
    {
        saveService = _saveService;
        pkmConvertService = _pkmConvertService;

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
        var bankLoader = new BankLoader();
        var boxLoader = new BoxLoader();
        var pkmLoader = new PkmLoader();
        var pkmVersionLoader = new PkmVersionLoader(pkmLoader);
        var dexLoader = new DexLoader();
        var saveLoadersDict = new Dictionary<uint, SaveLoaders>();

        var saveById = await saveService.GetSaveById();
        if (saveById.Count > 0)
        {
            saveById.Values.ToList().ForEach((_save) =>
            {
                // TODO find a cleaner way
                var save = _save.Clone();
                save.ID32 = _save.ID32; // required since it can be computed
                saveLoadersDict.Add(save.ID32, new()
                {
                    Save = save,
                    Boxes = new SaveBoxLoader(save),
                    Pkms = new SavePkmLoader(pkmConvertService, save)
                });
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
        var saveById = await saveService.GetSaveById();

        var time = LogUtil.Time($"Check saves to synchronize ({saveById.Count})");

        if (saveById.Count > 0)
        {
            foreach (var saveId in saveById.Keys)
            {
                var pkmsToSynchronize = SynchronizePkmAction.GetPkmsToSynchronize(loaders, saveId);
                if (pkmsToSynchronize.Length > 0)
                {
                    await AddAction(
                        loaders,
                        new SynchronizePkmAction(pkmConvertService, pkmsToSynchronize),
                        null
                    );
                }
            }
        }

        time();
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
