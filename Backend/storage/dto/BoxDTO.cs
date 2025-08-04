
using System.Text.Json;
using PKHeX.Core;

public class BoxDTO : IWithId<string>, ICloneable<BoxDTO>
{
    public const int PARTY_ID = -1;
    public const int DAYCARE_ID = -2;

    public static BoxDTO FromEntity(BoxEntity entity)
    {
        return new BoxDTO
        {
            Id = entity.Id,
            Type = BoxType.Default,
            Name = entity.Name,
            CanReceivePkm = true,
        };
    }

    public string Id { get; set; }

    public int IdInt
    {
        get { return Int32.Parse(Id); }
    }

    public BoxType Type { get; set; }

    public string Name { get; set; }

    public bool CanReceivePkm { get; set; }

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
