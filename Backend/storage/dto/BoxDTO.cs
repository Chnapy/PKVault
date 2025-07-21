
using System.Text.Json;
using PKHeX.Core;

public class BoxDTO : IWithId, ICloneable<BoxDTO>
{
    public static BoxDTO FromEntity(BoxEntity entity)
    {
        return new BoxDTO
        {
            Id = entity.Id,
            Name = entity.Name
        };
    }

    public long Id { get; set; }

    public string Name { get; set; }

    public BoxDTO Clone()
    {
        return JsonSerializer.Deserialize<BoxDTO>(
            JsonSerializer.Serialize(this)
        )!;
    }
}
