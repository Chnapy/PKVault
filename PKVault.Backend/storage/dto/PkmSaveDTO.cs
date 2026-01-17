using System.Text.Json.Serialization;
using PKHeX.Core;

public record PkmSaveDTO(
    string SettingsLanguage,
    ImmutablePKM Pkm,

    uint SaveId,
    int BoxId,
    int BoxSlot,
    bool IsDuplicate,

    [property: JsonIgnore] SaveWrapper Save,
    [property: JsonIgnore] Dictionary<ushort, StaticEvolve> Evolves
) : BasePkmVersionDTO(
    SavePkmLoader.GetPKMId(Pkm.GetPKMIdBase(Evolves), BoxId, BoxSlot),
    Save.Generation,
    SettingsLanguage,
    Pkm
)
{
    public string IdBase => Pkm.GetPKMIdBase(Evolves);

    public bool IsShadow => Pkm.IsShadow;
    public int Team => BoxSlotFlags.IsBattleTeam();
    public bool IsLocked => BoxSlotFlags.HasFlag(StorageSlotSource.Locked);
    public int Party => BoxSlotFlags.IsParty();
    public bool IsStarter => BoxSlotFlags.HasFlag(StorageSlotSource.Starter);

    public bool CanMove => !IsLocked && BoxLoader.CanIdReceivePkm(BoxId);
    public bool CanDelete => !IsLocked && CanMove;
    public bool CanMoveToMain => !IsLocked && Pkm.Version > 0 && Pkm.Generation > 0 && CanDelete && !Pkm.IsShadow && !Pkm.IsEgg && Party == -1;
    public bool CanMoveToSave => !IsLocked && Pkm.Version > 0 && Pkm.Generation > 0 && CanMoveToMain;
    public bool CanMoveAttachedToMain => CanMoveToMain && !IsDuplicate;

    private readonly StorageSlotSource BoxSlotFlags = Save.GetBoxSlotFlags(BoxId, BoxSlot);
}
