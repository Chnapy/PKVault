public record BankDTO(
    string Id,
    int IdInt,
    string Name,
    bool IsDefault,
    bool IsExternal,
    int Order,
    BankEntity.BankView View
) : IWithId;
