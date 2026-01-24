public record PkmVersionEntity(
    string Id,
    string BoxId,
    int BoxSlot,
    bool IsMain,
    uint? AttachedSaveId,
    string? AttachedSavePkmIdBase,
    byte Generation,
    string Filepath
) : IEntity(Id);
