public struct DataDTO
{
    public DataDTOType Type { get; set; } = DataDTOType.DATA_DTO;

    public StaticDataDTO? StaticData { get; set; }
    public List<BankDTO>? MainBanks { get; set; }
    public List<BoxDTO>? MainBoxes { get; set; }
    public List<PkmDTO>? MainPkms { get; set; }
    public List<PkmVersionDTO>? MainPkmVersions { get; set; }
    public List<DataSaveDTO>? Saves { get; set; }
    public Dictionary<ushort, Dictionary<uint, DexItemDTO>>? Dex { get; set; }
    public List<DataActionPayload>? Actions { get; set; }
    public WarningsDTO? Warnings { get; set; }
    public Dictionary<uint, SaveInfosDTO>? SaveInfos { get; set; }
    public List<BackupDTO>? Backups { get; set; }
    public SettingsDTO? Settings { get; set; }

    public DataDTO()
    {
    }
}

public class DataSaveDTO
{
    public uint SaveId { get; set; }
    public List<BoxDTO>? SaveBoxes { get; set; }
    public List<PkmSaveDTO>? SavePkms { get; set; }
}

public enum DataDTOType : uint
{
    DATA_DTO = 1
}
