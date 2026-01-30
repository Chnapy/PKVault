public class DataUpdateFlags
{
    public bool StaticData;
    public DataUpdateFlagsState MainBanks = new();
    public DataUpdateFlagsState MainBoxes = new();
    public DataUpdateFlagsState MainPkmVersions = new();
    public DataUpdateFlagsState Dex = new();
    public DataUpdateSaveListFlags Saves = new();
    public bool Warnings;
    public bool SaveInfos;
    public bool Backups;
    public bool Settings;
}

public class DataUpdateSaveFlags(uint saveId)
{
    public uint SaveId => saveId;
    public bool SaveBoxes;
    public DataUpdateFlagsState SavePkms = new();
}

public class DataUpdateSaveListFlags
{
    private readonly Dictionary<uint, DataUpdateSaveFlags> Saves = [];

    public bool All;

    public DataUpdateSaveFlags UseSave(uint saveId)
    {
        if (!Saves.TryGetValue(saveId, out var save))
        {
            save = new(saveId);
            Saves.Add(saveId, save);
        }
        return save;
    }

    public List<DataUpdateSaveFlags> GetSaves() => All ? [] : [.. Saves.Values];
}

public class DataUpdateFlagsState
{
    public bool All = false;
    public HashSet<string> Ids = [];
}
