using PKHeX.Core;

public class DataFileLoader : DataLoader
{
    protected override DataEntityLoaders CreateLoaders()
    {
        var boxLoader = new EntityJSONLoader<BoxEntity>(Path.Combine(Settings.dbDir, "box.json"));
        var pkmLoader = new EntityJSONLoader<PkmEntity>(Path.Combine(Settings.dbDir, "pkm.json"));
        var pkmVersionLoader = new EntityJSONLoader<PkmVersionEntity>(Path.Combine(Settings.dbDir, "pkm-version.json"));

        var getSaveLoaders = (uint saveId) =>
        {
            var save = LoadSave(saveId);

            return new SaveLoaders
            {
                Save = save,
                Boxes = new SaveBoxLoader(save),
                Pkms = new SavePkmLoader(save, pkmLoader, pkmVersionLoader)
            };
        };

        return new DataEntityLoaders
        {
            boxLoader = boxLoader,
            pkmLoader = pkmLoader,
            pkmVersionLoader = pkmVersionLoader,
            pkmFileLoader = new PKMFileLoader(),
            getSaveLoaders = getSaveLoaders,
        };
    }

    public void WriteSaves()
    {
        saveDict.Values.ToList()
        .ForEach(save =>
        {
            // Console.WriteLine($"BOX 2 AFTER box.16={save.GetBoxData(1)[16].Species}");

            LocalSaveService.WriteSave(save);
        });
    }
}