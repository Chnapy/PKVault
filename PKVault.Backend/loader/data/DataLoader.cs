using PKHeX.Core;

public abstract class DataLoader(DataEntityLoaders loaders)
{
    public readonly DataEntityLoaders loaders = loaders;

    public async Task ApplyAction(DataAction action, DataUpdateFlags flags)
    {
        var logtime = LogUtil.Time($"Apply action - {action.GetType()}");

        await action.ExecuteWithPayload(loaders, flags);

        logtime();
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
    public SaveBoxLoader Boxes { get; set; }
    public SavePkmLoader Pkms { get; set; }
};
