public class BoxEntity : IEntity
{
    public int SchemaVersion { get; set; } = 0;

    public required string Id { get; set; }

    public int IdInt
    {
        get { return int.Parse(Id); }
    }

    public BoxType Type { get; set; } = BoxType.Box;

    public required string Name { get; set; }

    public int SlotCount { get; set; } = 30;

    public int Order { get; set; } = 0;

    public string BankId { get; set; } = "";
}
