public record BoxEntity(
    string Id,
    string Name,
    int Order,
    BoxType Type,
    int SlotCount,
    string BankId
) : IEntity(Id);
