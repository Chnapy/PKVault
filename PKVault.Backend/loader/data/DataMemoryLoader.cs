public class DataMemoryLoader(DataEntityLoaders _loaders, DateTime startTime) : DataLoader(_loaders)
{
    public static DataMemoryLoader Create()
    {
        var dbDir = SettingsService.AppSettings.SettingsMutable.DB_PATH;

        var boxLoader = new BoxLoader();
        if (boxLoader.GetAllEntities().Count == 0)
        {
            boxLoader.WriteDto(new()
            {
                Type = BoxType.Box,
                BoxEntity = new()
                {
                    Id = "0",
                    Name = "Box 1"
                }
            });
        }

        var pkmLoader = new PkmLoader();
        var pkmVersionLoader = new PkmVersionLoader(pkmLoader);

        var saveLoadersDict = new Dictionary<uint, SaveLoaders>();
        LocalSaveService.SaveById.Values.ToList().ForEach((save) =>
        {
            // TODO find a cleaner way
            save = save.Clone();
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
            var pkmVersionsToSynchronize = SynchronizePkmAction.GetPkmVersionsToSynchronize(loaders, saveId);
            if (pkmVersionsToSynchronize.Length > 0)
            {
                await AddAction(
                    new SynchronizePkmAction(saveId, pkmVersionsToSynchronize),
                    null
                );
            }
        }
        time();
    }

    public void WriteFiles()
    {
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
