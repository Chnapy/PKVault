public record DataDTO(
    StaticDataDTO? StaticData,
    DataDTOState<Dictionary<string, BankDTO?>>? MainBanks,
    DataDTOState<Dictionary<string, BoxDTO?>>? MainBoxes,
    DataDTOState<Dictionary<string, PkmVariantDTO?>>? MainPkmVariants,
    DataDTOState<Dictionary<string, PkmLegalityDTO?>>? MainPkmLegalities,
    DataDTOState<Dictionary<ushort, Dictionary<uint, DexItemDTO>>>? Dex,
    List<DataSaveDTO>? Saves,
    bool InvalidateAllSaves,
    List<DataActionPayload>? Actions,
    WarningsDTO? Warnings,
    Dictionary<uint, SaveInfosDTO>? SaveInfos,
    List<BackupDTO>? Backups,
    SettingsDTO? Settings
)
{
    public DataDTOType Type => DataDTOType.DATA_DTO;
};

public record DataSaveDTO(
    uint SaveId,
    List<BoxDTO>? SaveBoxes,
    DataDTOState<Dictionary<string, PkmSaveDTO?>>? SavePkms,
    DataDTOState<Dictionary<string, PkmLegalityDTO?>>? SavePkmLegality
);

public enum DataDTOType : uint
{
    DATA_DTO = 1
}

public record DataDTOState<T>(bool All, T Data);
