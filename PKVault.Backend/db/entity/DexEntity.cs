using PKHeX.Core;

public record DexEntity(
    string Id,
    ushort Species,
    List<DexEntityForm> Forms
) : IEntity(Id);

public record DexEntityForm(
    byte Form,
    GameVersion Version,
    Gender Gender,
    bool IsCaught,
    bool IsCaughtShiny
);
