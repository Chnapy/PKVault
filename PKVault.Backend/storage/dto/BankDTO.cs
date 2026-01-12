using System.Text.Json.Serialization;

public record BankDTO(
    [property: JsonIgnore] BankEntity BankEntity
) : IWithId
{
    public string Id => BankEntity.Id;

    public int IdInt => BankEntity.IdInt;

    public string Name => BankEntity.Name;

    public bool IsDefault => BankEntity.IsDefault;

    public int Order => BankEntity.Order;

    public BankEntity.BankView View => BankEntity.View;
}
