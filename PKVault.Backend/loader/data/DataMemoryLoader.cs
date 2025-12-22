public class DataMemoryLoader(DataEntityLoaders _loaders, DateTime startTime) : DataLoader(_loaders)
{
    public static DataMemoryLoader Create()
    {
        var bankLoader = new BankLoader();
        var boxLoader = new BoxLoader();
        var pkmLoader = new PkmLoader();
        var pkmVersionLoader = new PkmVersionLoader(pkmLoader);

        var saveLoadersDict = new Dictionary<uint, SaveLoaders>();
        LocalSaveService.SaveById.Values.ToList().ForEach((_save) =>
        {
            // TODO find a cleaner way
            var save = _save.Clone();
            save.ID32 = _save.ID32; // required since it can be computed
            saveLoadersDict.Add(save.ID32, new()
            {
                Save = save,
                Boxes = new SaveBoxLoader(save),
                Pkms = new SavePkmLoader(save, pkmLoader, pkmVersionLoader)
            });
        });

        var startTime = DateTime.UtcNow;

        DataEntityLoaders loaders = new()
        {
            bankLoader = bankLoader,
            boxLoader = boxLoader,
            pkmLoader = pkmLoader,
            pkmVersionLoader = pkmVersionLoader,
            saveLoadersDict = saveLoadersDict,
        };

        return new(loaders, startTime);
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
        var time = LogUtil.Time($"Check saves to synchronize ({LocalSaveService.SaveById.Count})");
        foreach (var saveId in LocalSaveService.SaveById.Keys)
        {
            var pkmsToSynchronize = SynchronizePkmAction.GetPkmsToSynchronize(loaders, saveId);
            if (pkmsToSynchronize.Length > 0)
            {
                await AddAction(
                    new SynchronizePkmAction(pkmsToSynchronize),
                    null
                );
            }
        }
        time();
    }

    public void WriteFiles()
    {
        loaders.bankLoader.WriteToFile();
        loaders.boxLoader.WriteToFile();
        loaders.pkmLoader.WriteToFile();
        loaders.pkmVersionLoader.WriteToFile();

        foreach (var saveLoaders in loaders.saveLoadersDict.Values.ToList())
        {
            if (saveLoaders.Pkms.HasWritten || saveLoaders.Boxes.HasWritten)
            {
                LocalSaveService.WriteSave(saveLoaders.Save);
            }
        }
    }
}
