
public record DexMoveDTO(
    Dictionary<ushort, byte> LearnMoves,
    IEnumerable<ushort> EggMoves,
    // IEnumerable<ushort> EncounterMoves,
    IEnumerable<ushort> InheritMoves,
    IEnumerable<ushort> TMHMMoves,
    IEnumerable<ushort> TutorMoves
);
