public struct DataDTO
{
    public DataDTOType Type { get; set; } = DataDTOType.DATA_DTO;

    public required StaticDataDTO? StaticData { get; set; }
    public required DataDTOState<Dictionary<string, BankDTO?>>? MainBanks { get; set; }
    public required DataDTOState<Dictionary<string, BoxDTO?>>? MainBoxes { get; set; }
    public required DataDTOState<Dictionary<string, PkmDTO?>>? MainPkms { get; set; }
    public required DataDTOState<Dictionary<string, PkmVersionDTO?>>? MainPkmVersions { get; set; }
    public required DataDTOState<Dictionary<string, PkmLegalityDTO?>>? MainPkmLegalities { get; set; }
    public required List<DataSaveDTO>? Saves { get; set; }
    public required bool InvalidateAllSaves { get; set; }
    public required Dictionary<ushort, Dictionary<uint, DexItemDTO>>? Dex { get; set; }
    public required List<DataActionPayload>? Actions { get; set; }
    public required WarningsDTO? Warnings { get; set; }
    public required Dictionary<uint, SaveInfosDTO>? SaveInfos { get; set; }
    public required List<BackupDTO>? Backups { get; set; }
    public required SettingsDTO? Settings { get; set; }

    public DataDTO()
    {
    }
}

public class DataSaveDTO
{
    public required uint SaveId { get; set; }
    public required List<BoxDTO>? SaveBoxes { get; set; } = null;
    public required DataDTOState<Dictionary<string, PkmSaveDTO?>>? SavePkms { get; set; } = null;
    public required DataDTOState<Dictionary<string, PkmLegalityDTO?>>? SavePkmLegality { get; set; } = null;
}

public enum DataDTOType : uint
{
    DATA_DTO = 1
}

public class DataDTOState<T>
{
    public required bool All { get; set; }
    public required T Data { get; set; }
}
