using System.Text.Json.Serialization;
using PKHeX.Core;

public record PkmSaveDTO(
    string SettingsLanguage,
    ImmutablePKM Pkm,

    int BoxId,
    int BoxSlot,
    bool IsDuplicate,

    [property: JsonIgnore] SaveWrapper Save,
    Dictionary<ushort, StaticEvolve> Evolves
) : PkmBaseDTO(
    SavePkmLoader.GetPKMId(Pkm.GetPKMIdBase(Evolves), BoxId, BoxSlot),
    Save.Generation,
    BoxId,
    BoxSlot,
    IsDuplicate,
    SettingsLanguage,
    Pkm,
    Evolves
)
{
    public uint SaveId => Save.Id;

    public int Team => BoxSlotFlags.IsBattleTeam();
    public bool IsLocked => BoxSlotFlags.HasFlag(StorageSlotSource.Locked);
    public int Party => BoxSlotFlags.IsParty();
    public bool IsStarter => BoxSlotFlags.HasFlag(StorageSlotSource.Starter);

    public override bool CanMove => base.CanMove && !IsLocked && BoxLoader.CanIdReceivePkm(BoxId);
    public override bool CanDelete => base.CanDelete && !IsLocked && BoxLoader.CanIdReceivePkm(BoxId);
    public override bool CanMoveToSave => base.CanMoveToSave && !IsLocked;
    public bool CanMoveToMain => IsEnabled && Pkm.Version > 0 && Pkm.Generation > 0 && CanDelete && !IsShadow && !IsEgg && !IsLocked && Party == -1;
    public bool CanMoveAttachedToMain => CanMoveToMain && !IsDuplicate;

    private StorageSlotSource BoxSlotFlags => Save.GetBoxSlotFlags(BoxId, BoxSlot);
}
