public record BankEntity(
    string Id,
    string Name,
    bool IsDefault,
    int Order,
    BankEntity.BankView View
) : IEntity(Id)
{
    public record BankView(int[] MainBoxIds, BankViewSave[] Saves);

    public record BankViewSave(uint SaveId, int[] SaveBoxIds, int Order);
}
