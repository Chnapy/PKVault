using PKHeX.Core;

public class DataFileLoader : DataLoader
{
    protected override DataEntityLoaders CreateLoaders()
    {
        var boxLoader = new EntityJSONLoader<BoxEntity>("db/box.json");
        var pkmLoader = new EntityJSONLoader<PkmEntity>("db/pkm.json");
        var pkmVersionLoader = new EntityJSONLoader<PkmVersionEntity>("db/pkm-version.json");

        var getSaveLoaders = (uint saveId) =>
        {
            var save = LoadSave(saveId);

            return new SaveLoaders
            {
                Save = save,
                Boxes = new SaveBoxLoader(save),
                Pkms = new SavePkmLoader(save, pkmVersionLoader)
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
            Console.WriteLine($"BOX 2 AFTER box.16={save.GetBoxData(1)[16].Species}");

            LocalSaveService.WriteSaveWithBackup(save);
        });
    }
}