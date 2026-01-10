public class BoxEntity : IEntity
{
    public override int SchemaVersion { get; set; } = 0;

    public override required string Id { get; set; }

    public int IdInt => int.Parse(Id);

    public BoxType Type { get; set; } = BoxType.Box;

    public required string Name { get; set; }

    public int SlotCount { get; set; } = 30;

    public int Order { get; set; } = 0;

    public string BankId { get; set; } = "";

    public override BoxEntity Clone() => new()
    {
        SchemaVersion = SchemaVersion,
        Id = Id,
        Type = Type,
        Name = Name,
        SlotCount = SlotCount,
        Order = Order,
        BankId = BankId
    };
}
