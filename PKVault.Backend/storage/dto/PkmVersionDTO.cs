using System.Diagnostics;
using PKHeX.Core;

public class PkmVersionDTO : BasePkmVersionDTO
{
    public static PkmVersionDTO FromEntity(PkmVersionEntity entity, PKM pkm, PkmDTO pkmDto)
    {
        Stopwatch sw = new();
        sw.Start();

        var dto = new PkmVersionDTO(
            entity, pkm, pkmDto
        );

        sw.Stop();
        dto.LoadingDuration = sw.Elapsed.TotalMilliseconds;

        if (dto.Id != entity.Id)
        {
            throw new Exception($"Id mismatch dto.id={dto.Id} entity.id={entity.Id}");
        }

        return dto;
    }

    private static readonly Dictionary<int, IReadOnlyList<GameVersion>> compatibleVersionsBySpecies = [];

    private static readonly List<(GameVersion Version, SaveFile? Save)> allVersionBlankSaves = [..Enum.GetValues<GameVersion>().ToList()
        .Select(version => {
            var versionToUse = GetSingleVersion(version);

            if (versionToUse == default)
            {
                return (version, null!);
            }

            return (version, BlankSaveFile.Get(versionToUse));
        })];

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

    public new string Id => PkmVersionEntity.Id;

    public string PkmId => PkmVersionEntity.PkmId;

    public bool IsMain => Id == PkmId;

    // TODO possible perf issue
    public bool IsFilePresent { get; }

    public string Filepath => PkmVersionEntity.Filepath;

    public string FilepathAbsolute => Path.Combine(SettingsService.BaseSettings.AppDirectory, PkmVersionEntity.Filepath);

    public IReadOnlyList<GameVersion> CompatibleWithVersions { get; }

    public bool CanDelete => !IsMain;

    public readonly PkmVersionEntity PkmVersionEntity;

    public readonly PkmDTO PkmDto;

    private PkmVersionDTO(
        PkmVersionEntity entity, PKM pkm, PkmDTO pkmDto
    ) : base(entity.Id, pkm, entity.Generation)
    {
        PkmVersionEntity = entity;
        PkmDto = pkmDto;

        IsFilePresent = File.Exists(FilepathAbsolute);

        if (!compatibleVersionsBySpecies.TryGetValue(pkm.Species, out var compatibleWithVersions))
        {
            compatibleWithVersions = [..allVersionBlankSaves.FindAll(entry =>
            {
                return entry.Save != null && SaveInfosDTO.IsSpeciesAllowed(pkm.Species, entry.Save);
            }).Select(entry => entry.Version).Order()];
            compatibleVersionsBySpecies.Add(pkm.Species, compatibleWithVersions);
        }
        CompatibleWithVersions = compatibleWithVersions;
    }
}
