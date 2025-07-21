using PKHeX.Core;

public abstract class DataLoader
{
    // public List<BoxEntity> boxEntities;
    // public EntityLoader<PkmEntity> pkmLoader;
    // public EntityLoader<PkmVersionEntity> pkmVersionLoader;
    // public EntityLoader<PkmSaveDTO> savePkmLoader;
    // protected SaveFile? save;

    protected Dictionary<uint, SaveFile> saveDict = new();

    protected List<object> actions = new();

    // public DataLoader(SaveFile? _save)
    // {
    //     save = _save;
    // }

    public SaveFile LoadSave(uint saveId)
    {
        if (saveDict.TryGetValue(saveId, out var save))
        {
            return save;
        }

        Console.WriteLine($"Load save id={saveId}");

        var entity = SaveInfosEntity.GetSaveInfosEntity(saveId)!;
        save = SaveUtil.GetVariantSAV(entity.Filepath);
        if (save == null)
        {
            throw new Exception("Save is null");
        }

        saveDict.Add(saveId, save);

        return save;
    }

    public void AddAction(object action)
    {
        actions.Add(action);

        try
        {
            GetUpdatedData();
        }
        catch
        {
            actions.Remove(action);
            throw;
        }
    }

    public abstract UpdatedData GetUpdatedData();
}

public struct UpdatedData
{
    public EntityLoader<BoxEntity> boxLoader { get; set; }
    public EntityLoader<PkmEntity> pkmLoader { get; set; }
    public EntityLoader<PkmVersionEntity> pkmVersionLoader { get; set; }
    public PKMMemoryLoader pkmFileLoader;
    public Func<uint, SaveLoaders> getSaveLoaders { get; set; }
}

public struct SaveLoaders
{
    public EntityMemoryLoader<BoxDTO> Boxes { get; set; }
    public EntityMemoryLoader<PkmSaveDTO> Pkms { get; set; }
};
