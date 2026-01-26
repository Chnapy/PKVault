public class BankEntity : IEntity
{
    public record BankView(int[] MainBoxIds, BankViewSave[] Saves);

    public record BankViewSave(uint SaveId, int[] SaveBoxIds, int Order);

    public override required string Id { get; init; }
    public required string Name { get; set; }
    public required bool IsDefault { get; set; }
    public required int Order { get; set; }
    public required BankView View { get; set; }
}
