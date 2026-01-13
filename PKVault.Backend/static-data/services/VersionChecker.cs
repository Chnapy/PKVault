using System.Collections.Concurrent;
using PKHeX.Core;

public class VersionChecker
{
    private readonly ConcurrentDictionary<int, IReadOnlyList<GameVersion>> compatibleVersionsBySpecies = [];
    private readonly List<(GameVersion Version, SaveWrapper? Save)> allVersionBlankSaves;

    public VersionChecker()
    {
        allVersionBlankSaves = [..Enum.GetValues<GameVersion>().ToList()
        .Select(version => {
            var versionToUse = StaticDataService.GetSingleVersion(version);

            if (versionToUse == default)
            {
                return (version, null!);
            }

            return (version, new SaveWrapper(BlankSaveFile.Get(versionToUse), ""));
        })];
    }

    public IReadOnlyList<GameVersion> GetCompatibleVersionsForSpecies(ushort species)
    {
        if (!compatibleVersionsBySpecies.TryGetValue(species, out var compatibleWithVersions))
        {
            compatibleWithVersions = [..allVersionBlankSaves.FindAll(entry =>
            {
                return entry.Save != null && entry.Save.IsSpeciesAllowed(species);
            }).Select(entry => entry.Version).Order()];
            compatibleVersionsBySpecies.TryAdd(species, compatibleWithVersions);
        }
        return compatibleWithVersions;
    }
}
