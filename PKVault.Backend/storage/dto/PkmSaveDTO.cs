using System.Text.Json.Serialization;
using PKHeX.Core;

public class PkmSaveDTO : BasePkmVersionDTO
{
    public static PkmSaveDTO FromPkm(
        SaveFile save, PKM pkm, int boxId, int boxSlot
    )
    {
        var idBase = GetPKMIdBase(pkm);

        return new PkmSaveDTO(
            idBase,
            save, pkm, boxId, boxSlot
        );
    }

    public static string GetPKMId(string idBase, int box, int slot)
    {
        return $"{idBase}B{box}S{slot}"; ;
    }

    public string IdBase { get; }

    public uint SaveId { get; }

    public int BoxId { get; }

    public int BoxSlot { get; }

    public bool IsShadow { get; }

    public int Team { get; }

    public bool IsLocked { get; }

    public int Party { get; }

    public bool IsStarter { get; }

    // -- actions

    public bool CanMove { get; }

    public bool CanDelete { get; }

    public bool CanMoveToMain { get; }

    public bool CanMoveToSave { get; }

    [JsonIgnore()]
    public readonly SaveFile Save;

    private PkmSaveDTO(
        string idBase,
        SaveFile save, PKM pkm, int boxId, int boxSlot
    ) : base(GetPKMId(idBase, boxId, boxSlot), pkm, save.Generation)
    {
        Save = save;
        SaveId = save.ID32;
        BoxId = boxId;
        BoxSlot = boxSlot;

        IdBase = idBase;

        IsShadow = Pkm is IShadowCapture pkmShadow && pkmShadow.IsShadow;

        Team = Save.GetBoxSlotFlags(BoxId, BoxSlot).IsBattleTeam();
        IsLocked = Save.GetBoxSlotFlags(BoxId, BoxSlot).HasFlag(StorageSlotSource.Locked);
        Party = Save.GetBoxSlotFlags(BoxId, BoxSlot).IsParty();
        IsStarter = Save.GetBoxSlotFlags(BoxId, BoxSlot).HasFlag(StorageSlotSource.Starter);

        CanMove = !IsLocked && BoxDTO.CanIdReceivePkm(BoxId);
        CanDelete = !IsLocked && CanMove;
        CanMoveToMain = !IsLocked && Version > 0 && Generation > 0 && CanDelete && !IsShadow && !IsEgg && Party == -1;
        CanMoveToSave = !IsLocked && Version > 0 && Generation > 0 && CanMoveToMain;
    }

    public PkmVersionDTO? GetPkmVersion(PkmVersionLoader pkmVersionLoader)
    {
        var pkmVersion = pkmVersionLoader.GetDto(IdBase);
        if (pkmVersion?.PkmDto?.SaveId == Save.ID32)
        {
            return pkmVersion;
        }
        return null;
    }

    protected override LegalityAnalysis GetLegalitySafe()
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

        return GetLegalitySafe(Pkm, Save, slotType);
    }
}
