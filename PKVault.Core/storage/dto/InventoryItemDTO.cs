using PKHeX.Core;

namespace PKVault.Core;

public record InventoryItemDTO(
    string Id,
    int Item,
    string Name,
    InventoryType Type,
    GameVersion Version,
    int Count,
    int BoxId,
    int BoxSlot,
    bool CanBeHeld
) : IWithId;
