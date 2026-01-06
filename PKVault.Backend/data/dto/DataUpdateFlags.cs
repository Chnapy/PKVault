public class DataUpdateFlags
{
    public bool StaticData;
    public bool MainBanks;
    public bool MainBoxes;
    public bool MainPkms;
    public bool MainPkmVersions;
    public List<DataUpdateSaveFlags> Saves = [];
    public bool Dex;
    // public bool Actions;
    public bool Warnings;
    public bool SaveInfos;
    public bool Backups;
    public bool Settings;
}

public class DataUpdateSaveFlags
{
    public uint SaveId;
    public bool SaveBoxes;
    public bool SavePkms;
}
