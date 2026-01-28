public record LegacyBoxEntity(
    string Id,
    string Name,
    BoxType Type = BoxType.Box,
    int SlotCount = 30,
    int Order = 0,
    string BankId = "",
    int SchemaVersion = 0
) : ILegacyEntity(SchemaVersion, Id)
{
    public int IdInt => int.Parse(Id);
}
