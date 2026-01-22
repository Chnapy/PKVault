public record LegacyPkmEntity(
    string Id,
    uint BoxId,
    uint BoxSlot,
    uint? SaveId,
    int SchemaVersion = 0
) : IEntity(SchemaVersion, Id);
