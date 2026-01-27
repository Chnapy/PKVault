public class BoxEntity : IEntity
{
    public override required string Id { get; init; }
    public required int IdInt { get; init; }
    public required string Name { get; set; }
    public required int Order { get; set; }
    public required BoxType Type { get; set; }
    public required int SlotCount { get; set; }
    public required string BankId { get; set; }
}
