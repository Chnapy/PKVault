
using System.Text.Json;
using PKHeX.Core;
using PKHeX.Core.Searching;

public class PkmSaveDTO : BasePkmVersionDTO, ICloneable<PkmSaveDTO>
{
    public static PkmSaveDTO FromPkm(SaveFile save, PKM pkm, int box, int boxSlot,
    // List<PkmVersionEntity> pkmVersionEntities,
    EntityLoader<PkmVersionEntity> pkmVersionLoader
    // EntityLoader<PkmEntity> pkmLoader,
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

        var pkmVersionEntity = pkmVersionLoader.GetEntity(id);
        // pkmVersionEntities.Find(entity => entity.Id == id);
        dto.PkmVersionId = pkmVersionEntity?.Id;
        // if (pkmVersionEntity != default)
        // {
        //     var pkmEntity = pkmLoader.GetEntity(pkmVersionEntity.PkmId);

        //     var pkmBytes = pkmFileLoader.GetEntity(pkmVersionEntity);
        //     if (pkmBytes == default)
        //     {
        //         throw new Exception($"PKM-bytes is null, from entity Id={pkmVersionEntity.Id} Filepath={pkmVersionEntity.Filepath}");
        //     }
        //     var versionPkm = PKMLoader.CreatePKM(pkmBytes, pkmVersionEntity, pkmEntity);
        //     if (versionPkm == default)
        //     {
        //         throw new Exception($"PKM is null, from entity Id={pkmVersionEntity.Id} Filepath={pkmVersionEntity.Filepath} bytes.length={pkmBytes.Length}");
        //     }
        //     // var pkmVersion = PkmVersionDTO.FromEntity(pkmVersionEntity);
        // }

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
