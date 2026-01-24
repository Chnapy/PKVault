using PKHeX.Core;

public record LegacyDexEntity(
    string Id,
    ushort Species,
    List<LegacyDexEntityForm> Forms,
    int SchemaVersion = 0
) : ILegacyEntity(SchemaVersion, Id);

public record LegacyDexEntityForm(
    byte Form,
    GameVersion Version,
    Gender Gender,
    bool IsCaught,
    bool IsCaughtShiny
);
