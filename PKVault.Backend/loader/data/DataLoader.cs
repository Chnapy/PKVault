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
    public BankLoader bankLoader { get; set; }
    public BoxLoader boxLoader { get; set; }
    public PkmLoader pkmLoader { get; set; }
    public PkmVersionLoader pkmVersionLoader { get; set; }
    public Dictionary<uint, SaveLoaders> saveLoadersDict { get; set; }
}

public struct SaveLoaders
{
    public SaveFile Save { get; set; }
    public SaveBoxLoader Boxes { get; set; }
    public SavePkmLoader Pkms { get; set; }
};
