
using PKHeX.Core;

namespace PKVault.Core;

public record DexItemDTO(
    string Id,
    ushort Species,
    uint SaveId,
    List<DexItemForm> Forms,
    LanguageID[] Languages
) : IWithId;

public record DexItemForm(
    string Id,
    ushort Species,
    byte Form,
    Gender Gender,
    List<byte> Types,
    int[] Abilities,
    int AbilityHidden,
    int[] BaseStats,
    bool IsSeen,
    bool IsSeenShiny,
    bool IsSeenAlpha,
    bool IsCaught,
    bool IsOwned,
    bool IsOwnedShiny,
    EntityContext Context = default,
    byte Generation = default
) : IWithId;
