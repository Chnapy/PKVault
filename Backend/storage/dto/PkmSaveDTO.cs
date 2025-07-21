
using System.Text.Json;
using PKHeX.Core;

public class PkmSaveDTO : BasePkmVersionDTO, ICloneable<PkmSaveDTO>
{
    public static PkmSaveDTO FromPkm(SaveFile save, PKM pkm, int box, int boxSlot)
    {
        var id = pkm is PK2 || pkm is PK1
        ? pkm.TrainerTID7 + pkm.IV_HP + pkm.IV_ATK * 10 + pkm.IV_DEF * 100 + pkm.IV_SPA * 1000 + pkm.IV_SPD * 10_000 + pkm.IV_SPE * 100_000 + pkm.Generation * 1_000_000
        : pkm.TrainerTID7 + pkm.PID + pkm.Generation * 1_000_000;

        var dto = new PkmSaveDTO
        {
            Id = id,
            SaveId = save.ID32,
            Species = pkm.Species,
            IsShiny = pkm.IsShiny,
            Box = box,
            BoxSlot = boxSlot,
            Pkm = pkm
        };

        FillDTO(dto, pkm);

        return dto;
    }

    public uint SaveId { get; set; }

    public ushort Species { get; set; }

    public bool IsShiny { get; set; }

    public int Box { get; set; }

    public int BoxSlot { get; set; }

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
