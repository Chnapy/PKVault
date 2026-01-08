using PKHeX.Core;

public abstract class DataLoader(DataEntityLoaders loaders)
{
    public readonly DataEntityLoaders loaders = loaders;

    public async Task ApplyAction(DataAction action, DataUpdateFlags flags)
    {
        var logtime = LogUtil.Time($"Apply action - {action.GetType()}");

        loaders.SetFlags(flags);

        await action.ExecuteWithPayload(loaders, flags);

        logtime();
    }
}

public class DataEntityLoaders(SaveService saveService)
{
    public required BankLoader bankLoader { get; set; }
    public required BoxLoader boxLoader { get; set; }
    public required PkmLoader pkmLoader { get; set; }
    public required PkmVersionLoader pkmVersionLoader { get; set; }
    public required DexLoader dexLoader { get; set; }
    public required Dictionary<uint, SaveLoaders> saveLoadersDict { get; set; }

    public List<IEntityLoaderWrite> jsonLoaders => [bankLoader, boxLoader, pkmLoader, pkmVersionLoader, dexLoader];

    public void SetFlags(DataUpdateFlags flags)
    {
        bankLoader.SetFlags(flags.MainBanks);
        boxLoader.SetFlags(flags.MainBoxes);
        pkmLoader.SetFlags(flags.MainPkms);
        pkmVersionLoader.SetFlags(flags.MainPkmVersions);

        saveLoadersDict.Values.ToList().ForEach(saveLoader =>
        {
            saveLoader.Pkms.SetFlags(flags.Saves);
        });
    }

    public bool GetHasWritten() => jsonLoaders.Any(loader => loader.HasWritten);

    public async Task WriteToFiles()
    {
        var jsonTasks = jsonLoaders.Select(loader => loader.WriteToFile());

        foreach (var saveLoaders in saveLoadersDict.Values.ToList())
        {
            if (saveLoaders.Pkms.HasWritten || saveLoaders.Boxes.HasWritten)
            {
                saveService.WriteSave(saveLoaders.Save);
            }
        }

        await Task.WhenAll(jsonTasks);
    }

    public void SetupInitialData()
    {
        var time = LogUtil.Time("Data Setup");

        var loaders = this;
        jsonLoaders.ForEach(loader => loader.SetupInitialData(loaders));

        time();
    }

    public void MigrateGlobalEntities()
    {
        var time = LogUtil.Time("Data Migrate");

        var loaders = this;
        jsonLoaders.ForEach(loader => loader.MigrateGlobalEntities(loaders));

        time();
    }

    public void CleanData()
    {
        var time = LogUtil.Time("Data Clean");

        var loaders = this;
        jsonLoaders.ForEach(loader => loader.CleanData(loaders));

        time();
    }
}

public struct SaveLoaders
{
    public required SaveFile Save { get; set; }
    public required SaveBoxLoader Boxes { get; set; }
    public required SavePkmLoader Pkms { get; set; }
};
