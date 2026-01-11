using PKHeX.Core;

public class PkmLegalityDTO : IWithId
{
    private static readonly Lock legalityLock = new();

    /**
     * Check legality with correct global settings.
     * Required to expect same result as in PKHeX.
     *
     * If no save passed, some checks won't be done.
     */
    public static LegalityAnalysis GetLegalitySafe(ImmutablePKM pkm, SaveWrapper? save = null, StorageSlotType slotType = StorageSlotType.None)
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
                ? new LegalityAnalysis(pkm.GetPkm(), save.Personal, slotType)
                : new LegalityAnalysis(pkm.GetPkm(), pkm.PersonalInfo, slotType);

            ParseSettings.ClearActiveTrainer();

            return la;
        }
    }

    private static StorageSlotType GetPkmStorageType(PkmSaveDTO pkmSave)
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

    public string Id { get; }

    public uint? SaveId { get; }

    public List<bool> MovesLegality { get; }

    public bool IsValid { get; }

    public string ValidityReport { get; }

    public PkmLegalityDTO(PkmVersionDTO pkmVersion) : this(pkmVersion.Id, pkmVersion.Pkm, null)
    {
    }

    public PkmLegalityDTO(PkmSaveDTO pkmSave) : this(pkmSave.Id, pkmSave.Pkm, pkmSave.Save, GetPkmStorageType(pkmSave))
    {
        IsValid &= !pkmSave.IsDuplicate;
    }

    protected PkmLegalityDTO(
        string id,
        ImmutablePKM pkm,
        SaveWrapper? save,
        StorageSlotType slotType = StorageSlotType.None
    )
    {
        Id = id;
        SaveId = save?.ID32;

        var la = GetLegalitySafe(pkm, save, slotType);

        MovesLegality = [.. la.Info.Moves.Select(r => r.Valid)];

        IsValid = la.Parsed && la.Valid;

        try
        {
            ValidityReport = la.Report(
                SettingsService.BaseSettings.GetSafeLanguage()
            );
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"ValidityReport exception, id={id}");
            Console.Error.WriteLine(ex);
            ValidityReport = ex.ToString();
        }
    }
}
