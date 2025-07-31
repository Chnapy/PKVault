
using PKHeX.Core;

public class PkmVersionDTO : BasePkmVersionDTO
{
    public static PkmVersionDTO FromEntity(PkmVersionEntity entity, PKM pkm)
    {
        var dto = new PkmVersionDTO
        {
            Id = entity.Id,
            PkmId = entity.PkmId,
            Generation = entity.Generation,
        };

        FillDTO(dto, pkm);

        return dto;
    }

    public string PkmId { get; set; }
}
