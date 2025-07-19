
using PKHeX.Core;

public class BoxDTO
{
    public static BoxDTO FromEntity(BoxEntity entity)
    {
        return new BoxDTO
        {
            Id = entity.Id,
            Name = entity.Name,
            Order = entity.Order
        };
    }

    public long Id { get; set; }

    public string Name { get; set; }

    public uint Order { get; set; }
}
