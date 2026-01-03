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
    public required BankLoader bankLoader { get; set; }
    public required BoxLoader boxLoader { get; set; }
    public required PkmLoader pkmLoader { get; set; }
    public required PkmVersionLoader pkmVersionLoader { get; set; }
    public required DexLoader dexLoader { get; set; }
    public required Dictionary<uint, SaveLoaders> saveLoadersDict { get; set; }
}

public struct SaveLoaders
{
    public required SaveFile Save { get; set; }
    public required SaveBoxLoader Boxes { get; set; }
    public required SavePkmLoader Pkms { get; set; }
};
