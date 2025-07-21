
using PKHeX.Core;

public class PkmDTO
{
    public static PkmDTO FromEntity(PkmEntity entity)
    {
        return new PkmDTO
        {
            Id = entity.Id,
            Species = entity.Species,
            IsShiny = entity.IsShiny,
            BoxId = entity.BoxId,
            BoxSlot = entity.BoxSlot,
            SaveId = entity.SaveId
        };
    }

    public long Id { get; set; }

    public ushort Species { get; set; }

    public bool IsShiny { get; set; }

    public uint BoxId { get; set; }

    public uint BoxSlot { get; set; }

    public uint? SaveId { get; set; }
}
