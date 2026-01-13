public record BankDTO(
    string Id,
    int IdInt,
    string Name,
    bool IsDefault,
    int Order,
    BankEntity.BankView View
) : IWithId;
