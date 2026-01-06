
using PKHeX.Core;

public class PkmVersionDTO : BasePkmVersionDTO
{
    public static PkmVersionDTO FromEntity(WarningsService warningsService, PkmVersionEntity entity, PKM pkm, PkmDTO pkmDto)
    {
        var dto = new PkmVersionDTO
        {
            Pkm = pkm,
            PkmVersionEntity = entity,
            PkmDto = pkmDto,
        };

        dto.IsAttachedValid = pkmDto.SaveId == null
                || !warningsService.GetWarningsDTO().PkmVersionWarnings.Any(warn => warn.PkmVersionId == null
                    ? warn.PkmId == dto.Id
                    : warn.PkmVersionId == dto.Id);

        if (dto.Id != entity.Id)
        {
            throw new Exception($"Id mismatch dto.id={dto.Id} entity.id={entity.Id}");
        }

        return dto;
    }

    private static readonly List<(GameVersion Version, SaveFile? Save)> allVersionBlankSaves = [..Enum.GetValues<GameVersion>().ToList()
        .Select(version => {
            var versionToUse = GetSingleVersion(version);

            if (versionToUse == default)
            {
                return (version, null);
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
            var context = version.GetContext();

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

    public string PkmId { get { return PkmVersionEntity.PkmId; } }

    public bool IsMain { get { return Id == PkmId; } }

    public bool IsAttachedValid { get; set; }

    public new bool IsValid { get => base.IsValid && IsAttachedValid; }

    public bool IsFilePresent => File.Exists(Filepath);

    public string Filepath => Path.Combine(SettingsService.BaseSettings.AppDirectory, PkmVersionEntity.Filepath);

    // public bool CanMoveToSaveStorage { get { return PkmDto.SaveId == default; } }

    public List<GameVersion> CompatibleWithVersions
    {
        get
        {
            return [..allVersionBlankSaves.FindAll(entry =>
            {
                return entry.Save != null && SaveInfosDTO.IsSpeciesAllowed(Species, entry.Save);
            }).Select(entry => entry.Version).Order()];
        }
    }

    public bool CanDelete { get { return !IsMain; } }

    public required PkmVersionEntity PkmVersionEntity;

    public required PkmDTO PkmDto;

    private PkmVersionDTO() { }

    protected override LegalityAnalysis GetLegalitySafe()
    {
        return GetLegalitySafe(Pkm);
    }

    protected override byte GetGeneration()
    {
        return PkmVersionEntity.Generation;
    }
}
