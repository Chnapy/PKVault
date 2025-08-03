
using System.Text.Json;
using PKHeX.Core;

public class BoxDTO : IWithId<string>, ICloneable<BoxDTO>
{
    public static BoxDTO FromEntity(BoxEntity entity)
    {
        return new BoxDTO
        {
            Id = entity.Id,
            Type = BoxType.Default,
            Name = entity.Name
        };
    }

    public string Id { get; set; }

    public int IdInt
    {
        get { return Int32.Parse(Id); }
    }

    public BoxType Type { get; set; }

    public string? Name { get; set; }

    public BoxDTO Clone()
    {
        return JsonSerializer.Deserialize<BoxDTO>(
            JsonSerializer.Serialize(this)
        )!;
    }
}

public enum BoxType
{
    Default,
    Party,
    Daycare
}
