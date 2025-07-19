
using PKHeX.Core;

public class PkmDTO
{
    public static PkmDTO FromEntity(PkmEntity entity)
    {
        return new PkmDTO
        {
            Id = entity.Id,
            BoxId = entity.BoxId,
            BoxIndex = entity.BoxIndex,
            SaveId = entity.SaveId
        };
    }

    public long Id { get; set; }

    public uint BoxId { get; set; }

    public uint BoxIndex { get; set; }

    public uint? SaveId { get; set; }
}
