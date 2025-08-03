
using PKHeX.Core;

public class PkmVersionDTO : BasePkmVersionDTO
{
    public static PkmVersionDTO FromEntity(PkmVersionEntity entity, PKM pkm, PkmEntity pkmEntity)
    {
        var dto = new PkmVersionDTO
        {
            Id = entity.Id,
            PkmId = entity.PkmId,
            Generation = entity.Generation,
        };

        FillDTO(dto, pkm);

        dto.CanMoveToSaveStorage = pkmEntity.SaveId == default;
        dto.CanDelete = entity.Id != pkmEntity.Id;

        return dto;
    }

    public string PkmId { get; set; }

    public bool CanMoveToSaveStorage { get; set; }

    public bool CanDelete { get; set; }
}
