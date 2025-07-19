using PKHeX.Core;

public abstract class DataLoader
{
    // public List<BoxEntity> boxEntities;
    // public EntityLoader<PkmEntity> pkmLoader;
    // public EntityLoader<PkmVersionEntity> pkmVersionLoader;
    // public EntityLoader<PkmSaveDTO> savePkmLoader;
    protected SaveFile? save;

    protected List<object> actions = new List<object>();

    public DataLoader(SaveFile? _save)
    {
        save = _save;
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
    public Func<string, PKM> storagePkmByPaths;
    public EntityLoader<PkmSaveDTO> pkmSaveLoader { get; set; }
}
