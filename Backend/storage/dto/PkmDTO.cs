
using PKHeX.Core;

public class PkmDTO
{
    public static PkmDTO FromEntity(PkmEntity entity)
    {
        return new PkmDTO
        {
            Id = entity.Id,
            BoxId = entity.BoxId,
            BoxSlot = entity.BoxSlot,
            SaveId = entity.SaveId,
            Species = entity.Species,
            IsShiny = entity.IsShiny,
            Nickname = entity.Nickname,
            OTName = entity.OTName,
        };
    }

    public string Id { get; set; }

    public uint BoxId { get; set; }

    public uint BoxSlot { get; set; }

    public uint? SaveId { get; set; }

    public ushort Species { get; set; }

    public bool IsShiny { get; set; }

    public string Nickname { get; set; }

    public string OTName { get; set; }
}
