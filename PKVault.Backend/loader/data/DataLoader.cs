using PKHeX.Core;

public abstract class DataLoader
{
    public readonly DataEntityLoaders loaders;

    protected DataLoader(DataEntityLoaders _loaders)
    {
        loaders = _loaders;
    }

    public async Task ApplyAction(DataAction action)
    {
        Console.WriteLine($"Apply action - {action.GetType()}");
        await action.Execute(loaders);
    }
}

public struct DataEntityLoaders
{
    public EntityLoader<BoxDTO, BoxEntity> boxLoader { get; set; }
    public EntityLoader<PkmDTO, PkmEntity> pkmLoader { get; set; }
    public EntityLoader<PkmVersionDTO, PkmVersionEntity> pkmVersionLoader { get; set; }
    public Dictionary<uint, SaveLoaders> saveLoadersDict { get; set; }
}

public struct SaveLoaders
{
    public SaveFile Save { get; set; }
    public EntityLoader<BoxDTO, object> Boxes { get; set; }
    public EntityLoader<PkmSaveDTO, object> Pkms { get; set; }
};
