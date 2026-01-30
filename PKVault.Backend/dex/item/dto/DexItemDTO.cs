
using PKHeX.Core;

public record DexItemDTO(
    string Id,
    ushort Species,
    uint SaveId,
    List<DexItemForm> Forms
) : IWithId;

public record DexItemForm(
    string Id,
    ushort Species,
    byte Form,
    Gender Gender,
    List<byte> Types,
    int[] Abilities,
    int[] BaseStats,
    bool IsSeen,
    bool IsSeenShiny,
    bool IsCaught,
    bool IsOwned,
    bool IsOwnedShiny,
    EntityContext Context = default,
    byte Generation = default
) : IWithId;
