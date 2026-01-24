public class DataUpdateFlags
{
    public bool StaticData;
    public DataUpdateFlagsState<string> MainBanks = new();
    public DataUpdateFlagsState<string> MainBoxes = new();
    public DataUpdateFlagsState<string> MainPkmVersions = new();
    public DataUpdateSaveListFlags Saves = new();
    public bool Dex;
    public bool Warnings;
    public bool SaveInfos;
    public bool Backups;
    public bool Settings;
}

public class DataUpdateSaveFlags(uint saveId)
{
    public uint SaveId => saveId;
    public bool SaveBoxes;
    public DataUpdateFlagsState<string> SavePkms = new();
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

public class DataUpdateFlagsState<T>
{
    public bool All = false;
    public HashSet<T> Ids = [];
}
