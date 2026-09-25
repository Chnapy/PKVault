using System.Text.Json.Serialization;
using PKHeX.Core;

namespace PKVault.Core;

public record PkmSaveDTO(
    string Id,
    byte Generation,

    int BoxId,
    int BoxSlot,
    bool IsDuplicate
) : PkmBaseDTO(
    Id,
    Generation,
    BoxId,
    BoxSlot,
    IsDuplicate
)
{
    public override string IdBase => Pkm.GetPKMIdBase(Evolves, BoxId);
    public uint SaveId => Save.Id;

    public int Team => BoxSlotFlags.IsBattleTeam();
    public bool IsLocked => BoxSlotFlags.HasFlag(StorageSlotSource.Locked);
    public int Party => BoxSlotFlags.IsParty();
    public bool IsStarter => BoxSlotFlags.HasFlag(StorageSlotSource.Starter);

    public override bool CanMove => base.CanMove && !IsLocked && BoxLoader.CanIdReceivePkm(BoxId, Save.Version);
    public override bool CanDelete => base.CanDelete && !IsLocked && BoxLoader.CanIdReceivePkm(BoxId, Save.Version);
    public override bool CanEdit => base.CanEdit && !IsLocked && BoxLoader.CanIdReceivePkm(BoxId, Save.Version);
    public override bool CanMoveToSave => base.CanMoveToSave && !IsLocked;
    public bool CanMoveToMain => IsEnabled && Pkm.Version > 0 && Pkm.Generation > 0 && CanDelete && !IsShadow && !IsEgg && !IsLocked && Party == -1;
    public bool CanMoveAttachedToMain => CanMoveToMain && !IsDuplicate;

    private StorageSlotSource BoxSlotFlags => Save.GetBoxSlotFlags(BoxId, BoxSlot);

    [property: JsonIgnore]
    public SaveWrapper Save { get; init; } = default!;
}
