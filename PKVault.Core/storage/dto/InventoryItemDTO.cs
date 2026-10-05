using PKHeX.Core;

namespace PKVault.Core;

public record InventoryItemDTO(
    string Id,
    ushort Item,
    string Name,
    InventoryType Type,
    GameVersion Version,
    int Count,
    int BoxId,
    int BoxSlot,
    int InventorySlot,
    bool CanBeHeld
) : IWithId;
