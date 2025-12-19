using System.Text.Json.Serialization;
using PKHeX.Core;

public class PkmSaveDTO : BasePkmVersionDTO
{
    public static PkmSaveDTO FromPkm(SaveFile save, PKM pkm, int boxId, int boxSlot)
    {
        var dto = new PkmSaveDTO
        {
            Pkm = pkm,
            Save = save,
            BoxId = boxId,
            BoxSlot = boxSlot,
        };

        return dto;
    }

    public PkmSaveDTO Clone()
    {
        return new()
        {
            Pkm = Pkm,
            Save = Save,
            BoxId = BoxId,
            BoxSlot = BoxSlot,
            PkmVersionId = PkmVersionId,
            HasTradeEvolve = HasTradeEvolve
        };
    }

    public new string Id { get => GetPKMId(Pkm, BoxId, BoxSlot); }

    public string IdBase { get => base.Id; }

    public uint SaveId { get { return Save.ID32; } }

    public required int BoxId { get; set; }

    public required int BoxSlot { get; set; }

    public bool IsShadow { get { return Pkm is IShadowCapture pkmShadow && pkmShadow.IsShadow; } }

    public int Team { get => Save.GetBoxSlotFlags(BoxId, BoxSlot).IsBattleTeam(); }

    public bool IsLocked { get => Save.GetBoxSlotFlags(BoxId, BoxSlot).HasFlag(StorageSlotSource.Locked); }

    public int Party { get => Save.GetBoxSlotFlags(BoxId, BoxSlot).IsParty(); }

    public bool IsStarter { get => Save.GetBoxSlotFlags(BoxId, BoxSlot).HasFlag(StorageSlotSource.Starter); }

    public bool IsDuplicate { get => WarningsService.GetWarningsDTO().PkmDuplicateWarnings.Any(warn => warn.SaveId == SaveId && warn.DuplicateIdBases.Contains(IdBase)); }

    public new bool IsValid { get => base.IsValid && !IsDuplicate; }

    public new string ValidityReport
    {
        get
        {

            var slotType = BoxId switch
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

            if (Party >= 0)
            {
                slotType = StorageSlotType.Party;
            }

            var la = Pkm.GetType() == Save.PKMType // quick sanity check
                ? new LegalityAnalysis(Pkm, Save.Personal, slotType)
                : new LegalityAnalysis(Pkm, Pkm.PersonalInfo, slotType);

            try
            {
                return la.Report(
                    SettingsService.AppSettings.GetSafeLanguage()
                );
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex);
                return ex.ToString();
            }
        }
    }

    public string? PkmVersionId { get; set; }

    // -- actions

    public bool CanMove { get => !IsLocked && BoxDTO.CanIdReceivePkm(BoxId); }

    public bool CanDelete { get => !IsLocked && CanMove && PkmVersionId == null; }

    public bool CanMoveToMain { get => !IsLocked && Version > 0 && Generation > 0 && CanDelete && !IsShadow && !IsEgg && Party == -1; }

    public bool CanMoveToSave { get => !IsLocked && Version > 0 && Generation > 0 && CanMoveToMain; }

    public bool CanMoveAttachedToMain { get => !IsLocked && CanMoveToMain && !IsDuplicate; }

    [JsonIgnore()]
    public required SaveFile Save;

    public void RefreshPkmVersionId(PkmLoader pkmLoader, PkmVersionLoader pkmVersionLoader)
    {
        PkmVersionId = null;
        var pkmVersion = pkmVersionLoader.GetDto(IdBase);
        if (pkmVersion != null)
        {
            var mainPkm = pkmLoader.GetDto(pkmVersion.PkmDto.Id);

            if (mainPkm?.SaveId == Save.ID32)
            {
                PkmVersionId = pkmVersion.Id;
            }
        }
    }

    protected override uint GetGeneration()
    {
        return Save.Generation;
    }

    public static string GetPKMId(PKM pkm, int box, int slot)
    {
        return $"{GetPKMIdBase(pkm)}B{box}S{slot}"; ;
    }
}
