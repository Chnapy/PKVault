public record BankEntity(
    string Id,
    string Name,
    bool IsDefault,
    int Order,
    BankEntity.BankView View,
    int SchemaVersion = 0
) : IEntity(SchemaVersion, Id)
{
    public record BankView(int[] MainBoxIds, BankViewSave[] Saves);

    public record BankViewSave(uint SaveId, int[] SaveBoxIds, int Order);

    public int IdInt => int.Parse(Id);
}
