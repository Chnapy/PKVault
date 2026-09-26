
using System.Collections.Concurrent;
using System.Collections.Immutable;
using PKHeX.Core;

public class GameVersionUtil
{
    private readonly static ImmutableDictionary<GameVersion, GameVersion> singleVersions = [.. GetAllSingleVersions()];

    private static Dictionary<GameVersion, GameVersion> GetAllSingleVersions()
    {
        HashSet<GameVersion> ignoredVersions = [
            // default
            GameVersion.Any,
            GameVersion.Invalid,
            GameVersion.GO,
            GameVersion.CP,
        ];

        GameVersion GetSingleVersion(GameVersion version)
        {
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
                : GameUtil.GameVersions.FirstOrDefault(v => !ignoredVersions.Contains(v) && version.ContainsFromLumped(v));
        }

        return Enum.GetValues<GameVersion>().ToDictionary(
            k => k,
            GetSingleVersion
        );
    }

    /**
     * Get a valid single version from any version, including groups.
     */
    public static GameVersion GetSingleVersion(GameVersion version) => singleVersions.TryGetValue(version, out var singleVersion)
        ? singleVersion
        : default;

    private static IPersonalTable? GetPersonal(GameVersion version)
    {
        version = GetSingleVersion(version);

        return version switch
        {
            GameVersion.BATREV => PersonalTable.DP,
            // default
            GameVersion.Any => null,
            _ => GameData.GetPersonal(version),
        };
    }

    public static bool IsPresentInGame(GameVersion version, ushort species) => GetPersonal(version)?.IsSpeciesInGame(species) ?? false;

    public static bool IsPresentInGame(GameVersion version, ushort species, byte form) => GetPersonal(version)?.IsPresentInGame(species, form) ?? false;

    public class VersionChecker
    {
        private readonly ConcurrentDictionary<string, IReadOnlyList<GameVersion>> compatibleVersionsBySpecies = [];

        public IReadOnlyList<GameVersion> GetCompatibleVersionsForPKM(ushort species, byte form)
        {
            var key = $"{species}_{form}";
            if (!compatibleVersionsBySpecies.TryGetValue(key, out var compatibleWithVersions))
            {
                compatibleWithVersions = Enum.GetValues<GameVersion>()
                    .Where(version => IsPresentInGame(version, species, form))
                    .Order()
                    .ToArray();

                compatibleVersionsBySpecies.TryAdd(key, compatibleWithVersions);
            }
            return compatibleWithVersions;
        }
    }
}
