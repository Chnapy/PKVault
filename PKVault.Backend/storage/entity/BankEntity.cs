public class BankEntity : IWithId<string>
{
    public required string Id { get; set; }

    public int IdInt
    {
        get { return int.Parse(Id); }
    }

    public required string Name { get; set; }

    public required bool IsDefault { get; set; }

    public required int Order { get; set; }

    public required BankView View { get; set; }

    public record BankView(int[] MainBoxIds, BankViewSave[] Saves);

    public record BankViewSave(int SaveId, int[] SaveBoxIds, int Order);
}
