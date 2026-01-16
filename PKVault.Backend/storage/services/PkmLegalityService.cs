using PKHeX.Core;

public class PkmLegalityService(ISettingsService settingsService)
{
    private readonly Lock legalityLock = new();

    public PkmLegalityDTO CreateDTO(PkmVersionDTO pkmVersion)
    {
        return CreateDTO(pkmVersion.Id, pkmVersion.Pkm, null);
    }

    public PkmLegalityDTO CreateDTO(PkmSaveDTO pkmSave)
    {
        var dto = CreateDTO(pkmSave.Id, pkmSave.Pkm, pkmSave.Save, GetPkmStorageType(pkmSave));
        return dto with { IsValid = dto.IsValid && !pkmSave.IsDuplicate };
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
                IsValid: false,
                ValidityReport: ""
            );
        }

        var la = GetLegalitySafe(pkm, save, slotType);

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
            MovesLegality: [.. la.Info.Moves.Select(r => r.Valid)],
            IsValid: la.Parsed && la.Valid,
            ValidityReport
        );
    }

    /**
     * Check legality with correct global settings.
     * Required to expect same result as in PKHeX.
     *
     * If no save passed, some checks won't be done.
     */
    public LegalityAnalysis GetLegalitySafe(ImmutablePKM pkm, SaveWrapper? save = null, StorageSlotType slotType = StorageSlotType.None)
    {
        // lock required because of ParseSettings static context causing race condition
        lock (legalityLock)
        {
            if (save != null)
            {
                ParseSettings.InitFromSaveFileData(save.GetSave());
            }
            else
            {
                ParseSettings.ClearActiveTrainer();
            }

            var la = save != null && pkm.GetType() == save.PKMType // quick sanity check
                ? new LegalityAnalysis(pkm.GetMutablePkm(), save.Personal, slotType)
                : new LegalityAnalysis(pkm.GetMutablePkm(), pkm.PersonalInfo, slotType);

            ParseSettings.ClearActiveTrainer();

            return la;
        }
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
            (int)BoxType.Misc => StorageSlotType.Misc,
            (int)BoxType.Resort => StorageSlotType.Resort,
            (int)BoxType.Ride => StorageSlotType.Ride,
            (int)BoxType.Shiny => StorageSlotType.Shiny,
            _ => StorageSlotType.Box
        };

        if (pkmSave.Party >= 0)
        {
            slotType = StorageSlotType.Party;
        }

        return slotType;
    }
}
