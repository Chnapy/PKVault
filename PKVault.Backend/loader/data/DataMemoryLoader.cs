public class DataMemoryLoader(LocalSaveService saveService, PkmConvertService pkmConvertService, DataEntityLoaders _loaders, DateTime startTime) : DataLoader(_loaders)
{
    public static DataMemoryLoader Create(LocalSaveService saveService, WarningsService warningsService, PkmConvertService pkmConvertService)
    {
        var bankLoader = new BankLoader();
        var boxLoader = new BoxLoader();
        var pkmLoader = new PkmLoader();
        var pkmVersionLoader = new PkmVersionLoader(warningsService, pkmLoader);
        var dexLoader = new DexLoader();

        var saveLoadersDict = new Dictionary<uint, SaveLoaders>();
        saveService.SaveById.Values.ToList().ForEach((_save) =>
        {
            // TODO find a cleaner way
            var save = _save.Clone();
            save.ID32 = _save.ID32; // required since it can be computed
            saveLoadersDict.Add(save.ID32, new()
            {
                Save = save,
                Boxes = new SaveBoxLoader(save),
                Pkms = new SavePkmLoader(warningsService, pkmConvertService, save, pkmLoader, pkmVersionLoader)
            });
        });

        var startTime = DateTime.UtcNow;

        DataEntityLoaders loaders = new()
        {
            bankLoader = bankLoader,
            boxLoader = boxLoader,
            pkmLoader = pkmLoader,
            pkmVersionLoader = pkmVersionLoader,
            dexLoader = dexLoader,
            saveLoadersDict = saveLoadersDict,
        };

        return new(saveService, pkmConvertService, loaders, startTime);
    }

    public readonly DateTime startTime = startTime;
    public List<DataAction> actions = [];

    public async Task<DataUpdateFlags> AddAction(DataAction action, DataUpdateFlags? flags)
    {
        actions.Add(action);

        try
        {
            var flags2 = flags ?? new();
            await ApplyAction(action, flags2);
            return flags2;
        }
        catch
        {
            actions.Remove(action);
            throw;
        }
    }

    public async Task CheckSaveToSynchronize()
    {
        var time = LogUtil.Time($"Check saves to synchronize ({saveService.SaveById.Count})");
        foreach (var saveId in saveService.SaveById.Keys)
        {
            var pkmsToSynchronize = SynchronizePkmAction.GetPkmsToSynchronize(loaders, saveId);
            if (pkmsToSynchronize.Length > 0)
            {
                await AddAction(
                    new SynchronizePkmAction(pkmConvertService, pkmsToSynchronize),
                    null
                );
            }
        }
        time();
    }
}
