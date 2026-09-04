public record LegacyPkmVersionEntity(
    string Id,
    int BoxId,
    int BoxSlot,
    bool IsMain,
    uint? AttachedSaveId,
    string? AttachedSavePkmIdBase,
    byte Generation,
    string Filepath,
    string PkmId = "",  // for legacy migration only
    int SchemaVersion = 0
) : ILegacyEntity(SchemaVersion, Id);
