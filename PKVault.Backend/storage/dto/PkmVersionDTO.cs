using System.Diagnostics;
using System.Text.Json.Serialization;
using PKHeX.Core;

public record PkmVersionDTO : BasePkmVersionDTO
{
    public static PkmVersionDTO FromEntity(PkmVersionEntity entity, ImmutablePKM pkm, PkmDTO pkmDto)
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

    private static readonly List<(GameVersion Version, SaveWrapper? Save)> allVersionBlankSaves = [..Enum.GetValues<GameVersion>().ToList()
        .Select(version => {
            var versionToUse = GetSingleVersion(version);

            if (versionToUse == default)
            {
                return (version, null!);
            }

            return (version, new SaveWrapper(BlankSaveFile.Get(versionToUse), ""));
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

    [JsonIgnore()]
    public readonly PkmVersionEntity PkmVersionEntity;

    [JsonIgnore()]
    public readonly PkmDTO PkmDto;

    private PkmVersionDTO(
        PkmVersionEntity entity, ImmutablePKM pkm, PkmDTO pkmDto
    ) : base(entity.Id, pkm, entity.Generation)
    {
        PkmVersionEntity = entity;
        PkmDto = pkmDto;

        IsFilePresent = File.Exists(FilepathAbsolute);

        if (!compatibleVersionsBySpecies.TryGetValue(pkm.Species, out var compatibleWithVersions))
        {
            compatibleWithVersions = [..allVersionBlankSaves.FindAll(entry =>
            {
                return entry.Save != null && entry.Save.IsSpeciesAllowed(pkm.Species);
            }).Select(entry => entry.Version).Order()];
            compatibleVersionsBySpecies.Add(pkm.Species, compatibleWithVersions);
        }
        CompatibleWithVersions = compatibleWithVersions;
    }

    public override PkmVersionDTO WithPKM(ImmutablePKM pkm)
    {
        return FromEntity(
            PkmVersionEntity, pkm, PkmDto
        );
    }
}
