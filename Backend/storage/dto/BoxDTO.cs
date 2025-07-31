
using System.Text.Json;
using PKHeX.Core;

public class BoxDTO : IWithId<string>, ICloneable<BoxDTO>
{
    public static BoxDTO FromEntity(BoxEntity entity)
    {
        return new BoxDTO
        {
            Id = entity.Id,
            Name = entity.Name
        };
    }

    public string Id { get; set; }

    public int IdInt
    {
        get { return Int32.Parse(Id); }
    }

    public string Name { get; set; }

    public BoxDTO Clone()
    {
        return JsonSerializer.Deserialize<BoxDTO>(
            JsonSerializer.Serialize(this)
        )!;
    }
}
