
using System.Collections.Concurrent;
using PKHeX.Core;
using PKVault.Core;

public class GameVersionUtil
{
    /**
     * Get a valid single version from any version, including groups.
     */
    public static GameVersion GetSingleVersion(GameVersion version)
    {
        HashSet<GameVersion> ignoredVersions = [
            default,
            GameVersion.Any,
            GameVersion.Invalid,
            GameVersion.GO,
            GameVersion.CP,
        ];

        if (ignoredVersions.Contains(version))
        {
            var context = version.Context;

            try
            {
                return context.GetSingleGameVersion();
            }
            catch
            {
                return default;
            }
        }

        return version.IsValidSavedVersion()
            ? version
            : GameUtil.GameVersions.ToList().Find(v => !ignoredVersions.Contains(v) && version.ContainsFromLumped(v));
    }

    public class VersionChecker
    {
        private readonly ConcurrentDictionary<int, IReadOnlyList<GameVersion>> compatibleVersionsBySpecies = [];
        private readonly List<(GameVersion Version, SaveWrapper? Save)> allVersionBlankSaves;

        public VersionChecker()
        {
            allVersionBlankSaves = [..Enum.GetValues<GameVersion>().ToList()
            .Select(version => {
                var versionToUse = GameVersionUtil.GetSingleVersion(version);

                if (versionToUse == default)
                {
                    return (version, null!);
                }

                return (version, new SaveWrapper(BlankSaveFile.Get(versionToUse)));
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
}
