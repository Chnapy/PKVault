
using PKHeX.Core;

public class PkmVersionDTO : BasePkmVersionDTO
{
    public static async Task<PkmVersionDTO> FromEntity(PkmVersionEntity entity, PKM pkm, PkmDTO pkmDto)
    {
        var dto = new PkmVersionDTO
        {
            Pkm = pkm,
            PkmVersionEntity = entity,
            PkmDto = pkmDto,
        };

        await dto.RefreshAsyncData(
            SaveUtil.GetBlankSAV(pkm.Context, "")
        );

        if (dto.Id != entity.Id)
        {
            throw new Exception($"Id mismatch dto.id={dto.Id} entity.id={entity.Id}");
        }

        return dto;
    }

    private static readonly List<SaveFile> allVersionBlankSaves = [..Enum.GetValues<GameVersion>().ToList()
        .Select(version => {
            try {
                return SaveUtil.GetBlankSAV(version, "BLANK");
            } catch (ArgumentOutOfRangeException)
            {
                return null;
            }
        }).OfType<SaveFile>()];

    public string PkmId { get { return PkmVersionEntity.PkmId; } }

    public bool IsMain { get { return Id == PkmId; } }

    // public bool CanMoveToSaveStorage { get { return PkmDto.SaveId == default; } }

    public List<GameVersion> CompatibleWithVersions
    {
        get
        {
            // if (!IsMain)
            // {
            //     return [];
            // }

            return [..allVersionBlankSaves.FindAll(blankSav =>
            {
                    return SaveInfosDTO.IsSpeciesAllowed(Species, blankSav);
            }).Select(blankSav => blankSav.Version)];
        }
    }

    public bool CanDelete { get { return !IsMain; } }

    public override bool CanEvolve { get => HasTradeEvolve && PkmDto.SaveId == null; }

    public required PkmVersionEntity PkmVersionEntity;

    public required PkmDTO PkmDto;

    private PkmVersionDTO() { }

    protected override uint GetGeneration()
    {
        return PkmVersionEntity.Generation;
    }
}
