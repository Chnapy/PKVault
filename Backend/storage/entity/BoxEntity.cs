
using System.Text.Json;

public class BoxEntity : IWithId<string>, ICloneable<BoxEntity>
{
    public string Id { get; set; }

    public int IdInt
    {
        get { return Int32.Parse(Id); }
    }

    public string Name { get; set; }

    public BoxEntity Clone()
    {
        return JsonSerializer.Deserialize<BoxEntity>(
            JsonSerializer.Serialize(this)
        )!;
    }
}
