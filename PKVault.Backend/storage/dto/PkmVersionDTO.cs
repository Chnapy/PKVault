
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

        await dto.RefreshAsyncData();

        if (dto.Id != entity.Id)
        {
            throw new Exception($"Id mismatch dto.id={dto.Id} entity.id={entity.Id}");
        }

        return dto;
    }

    public string PkmId { get { return PkmVersionEntity.PkmId; } }

    public bool IsMain { get { return Id == PkmId; } }

    public bool CanMoveToSaveStorage { get { return PkmDto.SaveId == default; } }

    public bool CanDelete { get { return PkmVersionEntity.Id != PkmDto.Id; } }

    public override bool CanEvolve { get => HasTradeEvolve && PkmDto.SaveId == null; }

    public required PkmVersionEntity PkmVersionEntity;

    public required PkmDTO PkmDto;

    private PkmVersionDTO() { }

    protected override uint GetGeneration()
    {
        return PkmVersionEntity.Generation;
    }
}
