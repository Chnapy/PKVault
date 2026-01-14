using System.Text.Json.Serialization;
using PKHeX.Core;

public record PkmVersionDTO(
    string Id,
    byte Generation,
    string SettingsLanguage,
    ImmutablePKM Pkm,

    string PkmId,
    bool IsFilePresent,
    string Filepath,
    string FilepathAbsolute,

    [property: JsonIgnore] VersionChecker VersionChecker
) : BasePkmVersionDTO(
    Id,
    Generation,
    SettingsLanguage,
    Pkm
)
{
    public bool IsMain => Id == PkmId;
    public IReadOnlyList<GameVersion> CompatibleWithVersions => VersionChecker.GetCompatibleVersionsForSpecies(Pkm.Species);
    public bool CanDelete => !IsMain;
};
