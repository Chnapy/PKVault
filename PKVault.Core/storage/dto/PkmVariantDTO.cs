using System.Text.Json.Serialization;
using PKHeX.Core;

public record PkmVariantDTO(
    string Id,
    byte Generation,
    string SettingsLanguage,
    ImmutablePKM Pkm,

    int BoxId,
    int BoxSlot,
    bool IsMain,
    bool IsExternal,
    uint? AttachedSaveId,
    string? AttachedSavePkmIdBase,

    bool IsFilePresent,
    string Filepath,
    string FilepathAbsolute,

    [property: JsonIgnore] VersionChecker VersionChecker,
    Dictionary<ushort, StaticEvolve> Evolves
) : PkmBaseDTO(
    Id,
    Generation,
    BoxId,
    BoxSlot,
    IsDuplicate: false,
    SettingsLanguage,
    Pkm,
    Evolves
)
{
    public bool CanMoveAttachedToSave => CanMoveToSave && AttachedSaveId == null;

    public override bool CanDelete => !IsExternal && base.CanDelete;
    public override bool CanMoveToSave => !IsExternal && base.CanMoveToSave;

    public override bool CanEdit => !IsExternal && base.CanEdit;
    public override bool CanEvolve => !IsExternal && base.CanEvolve;
    public bool CanCreateVariant => !IsExternal && IsMain && IsEnabled;

    public IReadOnlyList<GameVersion> CompatibleWithVersions => VersionChecker.GetCompatibleVersionsForSpecies(Pkm.Species);
}
