using System.Text.Json.Serialization;
using PKHeX.Core;

public record PkmVersionDTO(
    string Id,
    byte Generation,
    string SettingsLanguage,
    ImmutablePKM Pkm,

    int BoxId,
    int BoxSlot,
    bool IsMain,
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

    public IReadOnlyList<GameVersion> CompatibleWithVersions => VersionChecker.GetCompatibleVersionsForSpecies(Pkm.Species);
}
