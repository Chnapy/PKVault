
using System.Text.Json;
using PKHeX.Core;
using PKHeX.Core.AutoMod;
using PKHeX.Core.Searching;

public class PkmSaveDTO : BasePkmVersionDTO, ICloneable<PkmSaveDTO>
{
    public static PkmSaveDTO FromPkm(SaveFile save, PKM pkm, BoxType boxType, int box, int boxSlot, List<PkmEntity> pkmEntities)
    {
        var id = GetPKMId(pkm, save.Generation);

        var dto = new PkmSaveDTO
        {
            Id = id,
            SaveId = save.ID32,
            Generation = save.Generation,
            Species = pkm.Species,
            Nickname = pkm.Nickname,
            Gender = pkm.Gender,
            IsShiny = pkm.IsShiny,
            IsShadow = pkm is IShadowCapture pkmShadow ? pkmShadow.IsShadow : false,
            BoxType = boxType,
            Box = box,
            BoxSlot = boxSlot,
            Pkm = pkm
        };

        FillDTO(dto, pkm);

        dto.PkmId = pkmEntities.Find(entity => entity.Id == id)?.Id;
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

    public BoxType BoxType { get; set; }

    public int Box { get; set; }

    public int BoxSlot { get; set; }

    public ushort Species { get; set; }

    public string Nickname { get; set; }

    public byte Gender { get; set; }

    public bool IsShiny { get; set; }

    public bool IsShadow { get; set; }

    public string? PkmId { get; set; }

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
