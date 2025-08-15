using PKHeX.Core;

public abstract class DataLoader
{
    public DataEntityLoaders loaders;

    protected Dictionary<uint, SaveFile> saveDict = new();

    public DataLoader()
    {
        loaders = CreateLoaders();
    }

    protected abstract DataEntityLoaders CreateLoaders();

    protected SaveFile LoadSave(uint saveId)
    {
        if (saveDict.TryGetValue(saveId, out var save))
        {
            return save;
        }

        Console.WriteLine($"Load save id={saveId}");

        save = LocalSaveService.GetSaveFromId(saveId);
        if (save == null)
        {
            throw new Exception("Save is null");
        }

        saveDict.TryAdd(saveId, save);

        return save;
    }

    public async Task ApplyAction(DataAction action)
    {
        await action.Execute(loaders);
    }
}

public struct DataEntityLoaders
{
    public EntityLoader<BoxEntity> boxLoader { get; set; }
    public EntityLoader<PkmEntity> pkmLoader { get; set; }
    public EntityLoader<PkmVersionEntity> pkmVersionLoader { get; set; }
    public PKMLoader pkmFileLoader;
    public Func<uint, SaveLoaders> getSaveLoaders { get; set; }
}

public struct SaveLoaders
{
    public SaveFile Save { get; set; }
    public EntityLoader<BoxDTO> Boxes { get; set; }
    public EntityLoader<PkmSaveDTO> Pkms { get; set; }
};
