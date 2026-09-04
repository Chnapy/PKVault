using PKHeX.Core;

namespace PKVault.Core;

public record DexMoveDTO(
    EntityContext Context,
    Dictionary<ushort, byte> LearnMoves,
    IEnumerable<ushort> EggMoves,
    // IEnumerable<ushort> EncounterMoves,
    IEnumerable<ushort> InheritMoves,
    IEnumerable<ushort> TMHMMoves,
    IEnumerable<ushort> TutorMoves
);
