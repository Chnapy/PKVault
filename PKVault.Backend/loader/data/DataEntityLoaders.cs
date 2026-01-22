using PKHeX.Core;

public class DataEntityLoaders(ISaveService saveService)
{
    public DateTime startTime = DateTime.UtcNow;

    public readonly List<DataAction> actions = [];

    public required IBankLoader bankLoader { get; set; }
    public required IBoxLoader boxLoader { get; set; }
    public required ILegacyPkmLoader legacyPkmLoader { get; set; }
    public required IPkmVersionLoader pkmVersionLoader { get; set; }
    public required IDexLoader dexLoader { get; set; }
    public required Dictionary<uint, SaveLoaders> saveLoadersDict { get; set; }

    public List<IEntityLoaderWrite> jsonLoaders => [bankLoader, boxLoader, legacyPkmLoader, pkmVersionLoader, dexLoader];

    public void SetFlags(DataUpdateFlags flags)
    {
        bankLoader.SetFlags(flags.MainBanks);
        boxLoader.SetFlags(flags.MainBoxes);
        pkmVersionLoader.SetFlags(flags.MainPkmVersions);

        saveLoadersDict.Values.ToList().ForEach(saveLoader =>
        {
            saveLoader.Pkms.SetFlags(flags.Saves);
        });
    }

    public bool GetHasWritten() => jsonLoaders.Any(loader => loader.HasWritten)
        || saveLoadersDict.Values.Any(saveLoaders => saveLoaders.Pkms.HasWritten || saveLoaders.Boxes.HasWritten);

    public async Task WriteToFiles()
    {
        List<Task> tasks = [.. jsonLoaders.Select(loader => loader.WriteToFile())];

        foreach (var saveLoaders in saveLoadersDict.Values.ToList())
        {
            if (saveLoaders.Pkms.HasWritten || saveLoaders.Boxes.HasWritten)
            {
                tasks.Add(
                    saveService.WriteSave(saveLoaders.Save)
                );
            }
        }

        await Task.WhenAll(tasks);
    }
}

public record SaveLoaders(
    SaveWrapper Save,
    ISaveBoxLoader Boxes,
    ISavePkmLoader Pkms
);
