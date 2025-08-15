
using System.Text.Json;
using PKHeX.Core;
using PKHeX.Core.Searching;

public class PkmSaveDTO : BasePkmVersionDTO, ICloneable<PkmSaveDTO>
{
    public static PkmSaveDTO FromPkm(SaveFile save, PKM pkm, int box, int boxSlot,
    // List<PkmVersionEntity> pkmVersionEntities,
    EntityLoader<PkmEntity> pkmLoader,
    EntityLoader<PkmVersionEntity> pkmVersionLoader
    // PKMFileLoader pkmFileLoader
    )
    {
        var id = GetPKMId(pkm, save.Generation);

        var dto = new PkmSaveDTO
        {
            Id = id,
            SaveId = save.ID32,
            Generation = save.Generation,
            IsShadow = pkm is IShadowCapture pkmShadow ? pkmShadow.IsShadow : false,
            // BoxType = boxType,
            Box = box,
            BoxSlot = boxSlot,
            Pkm = pkm
        };

        FillDTO(dto, pkm);

        var pkmVersion = pkmVersionLoader.GetEntity(id);
        if (pkmVersion != default)
        {
            var mainPkm = pkmLoader.GetAllEntities().Find(pkm => pkm.Id == pkmVersion.PkmId);

            if (mainPkm.SaveId == save.ID32)
            {
                dto.PkmVersionId = pkmVersion.Id;
            }
        }

        dto.CanMoveToMainStorage = !dto.IsShadow && !dto.IsEgg;

        return dto;
    }

    public static string GetPKMId(PKM pkm, uint generation)
    {
        var hash = SearchUtil.HashByDetails(pkm);
        var id = $"G{generation}{hash}";

        return id;
    }

    public uint SaveId { get; set; }

    // public BoxType BoxType { get; set; }

    public int Box { get; set; }

    public int BoxSlot { get; set; }

    public bool IsShadow { get; set; }

    public string? PkmVersionId { get; set; }

    // -- actions

    // public bool CanMoveInBox { get; set; }

    public bool CanMoveToMainStorage { get; set; }

    public PKM Pkm;

    public PkmSaveDTO Clone()
    {
        var clone = JsonSerializer.Deserialize<PkmSaveDTO>(
            JsonSerializer.Serialize(this)
        )!;

        clone.Pkm = Pkm;

        return clone;
    }
}
