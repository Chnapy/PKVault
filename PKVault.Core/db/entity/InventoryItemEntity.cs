using PKHeX.Core;

namespace PKVault.Core;

public class InventoryItemEntity : IEntity
{
    public override required string Id { get; init; }
    public required int IdInt { get; init; }
    public required string ItemKey { get; init; }
    public required int Item { get; init; }
    public required GameVersion Version { get; init; }
    public required int Count { get; set; }
    public required int BoxId { get; set; }
    public required int BoxSlot { get; set; }
}
