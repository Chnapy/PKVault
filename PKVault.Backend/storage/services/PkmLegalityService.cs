using PKHeX.Core;

public class PkmLegalityService(ISettingsService settingsService, ILegalityAnalysisService legalityAnalysisService)
{
    public async Task<PkmLegalityDTO> CreateDTO(PkmVariantEntity pkmVariant, ImmutablePKM pkm, SaveWrapper? attachedSave)
    {
        return CreateDTO(pkmVariant.Id, pkm, attachedSave);
    }

    public PkmLegalityDTO CreateDTO(PkmSaveDTO pkmSave)
    {
        return CreateDTO(pkmSave.Id, pkmSave.Pkm, pkmSave.Save, GetPkmStorageType(pkmSave));
    }

    private PkmLegalityDTO CreateDTO(
        string id,
        ImmutablePKM pkm,
        SaveWrapper? save,
        StorageSlotType slotType = StorageSlotType.None
    )
    {
        if (!pkm.IsEnabled)
        {
            return new(
                Id: id,
                SaveId: save?.Id,
                MovesLegality: [],
                RelearnMovesLegality: [],
                IsValid: false,
                ValidityReport: "",
                IllegalitiesCount: 0
            );
        }

        var la = legalityAnalysisService.GetLegalitySafe(pkm, save, slotType);

        string ValidityReport;
        try
        {
            ValidityReport = la.Report(
                settingsService.GetSettings().GetSafeLanguage()
            );
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"ValidityReport exception, id={id}");
            Console.Error.WriteLine(ex);
            ValidityReport = ex.ToString();
        }

        return new(
            Id: id,
            SaveId: save?.Id,
            MovesLegality: [.. la.MovesValid],
            RelearnMovesLegality: [.. la.RelearnValid],
            IsValid: la.Parsed && la.Valid,
            ValidityReport,
            IllegalitiesCount: la.Valid
                ? 0
                : (
                    la.Results.Count(r => !r.Valid)
                    + la.MovesValid.Count(r => !r)
                    + la.RelearnValid.Count(r => !r)
                )
        );
    }

    private StorageSlotType GetPkmStorageType(PkmSaveDTO pkmSave)
    {
        var slotType = pkmSave.BoxId switch
        {
            (int)BoxType.Party => StorageSlotType.Party,
            (int)BoxType.BattleBox => StorageSlotType.BattleBox,
            (int)BoxType.Daycare => StorageSlotType.Daycare,
            (int)BoxType.GTS => StorageSlotType.GTS,
            // (int)BoxType.Fused => StorageSlotType.Fused,
            (int)BoxType.Underground => StorageSlotType.Underground,
            (int)BoxType.Resort => StorageSlotType.Resort,
            (int)BoxType.Ride => StorageSlotType.Ride,
            (int)BoxType.Shiny => StorageSlotType.Shiny,
            (int)BoxType.BattleAgency => StorageSlotType.BattleAgency,
            (int)BoxType.Pokéwalker => StorageSlotType.Pokéwalker,
            _ => StorageSlotType.Box
        };

        if (pkmSave.Party >= 0)
        {
            slotType = StorageSlotType.Party;
        }

        return slotType;
    }
}
