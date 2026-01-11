public record BoxEntity(
    string Id,
    string Name,
    BoxType Type = BoxType.Box,
    int SlotCount = 30,
    int Order = 0,
    string BankId = "",
    int SchemaVersion = 0
) : IEntity(SchemaVersion, Id)
{
    public int IdInt => int.Parse(Id);
}
