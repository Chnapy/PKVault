public class BankEntity : IEntity
{
    public record BankView(int[] MainBoxIds, BankViewSave[] Saves);

    public record BankViewSave(uint SaveId, int[] SaveBoxIds, int Order);

    public override int SchemaVersion { get; set; } = 0;

    public override required string Id { get; set; }

    public int IdInt => int.Parse(Id);

    public required string Name { get; set; }

    public required bool IsDefault { get; set; }

    public required int Order { get; set; }

    public required BankView View { get; set; }

    public override BankEntity Clone() => new()
    {
        SchemaVersion = SchemaVersion,
        Id = Id,
        Name = Name,
        IsDefault = IsDefault,
        Order = Order,
        View = View
    };
}
