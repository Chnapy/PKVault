using System.Text.Json.Serialization;
using PKHeX.Core;

namespace PKVault.Core;

public record PkmVariantDTO(
    string Id,
    byte Generation,

    int BoxId,
    int BoxSlot,
    bool IsMain,
    bool IsExternal,
    uint? AttachedSaveId,
    string? AttachedSavePkmIdBase,

    bool IsFilePresent,
    string Filepath,
    string FilepathAbsolute
) : PkmBaseDTO(
    Id,
    Generation,
    BoxId,
    BoxSlot,
    IsDuplicate: false
)
{
    public bool CanMoveAttachedToSave => CanMoveToSave && AttachedSaveId == null;

    public override bool CanDelete => !IsExternal && base.CanDelete;
    public override bool CanMoveToSave => !IsExternal && base.CanMoveToSave;

    public override bool CanEdit => !IsExternal && base.CanEdit;
    public override bool CanEvolve => !IsExternal && base.CanEvolve;
    public bool CanCreateVariant => !IsExternal && IsMain && IsEnabled;

    public IReadOnlyList<GameVersion> CompatibleWithVersions => VersionChecker.GetCompatibleVersionsForSpecies(Pkm.Species);

    [property: JsonIgnore]
    public GameVersionUtil.VersionChecker VersionChecker { get; init; } = default!;
}
