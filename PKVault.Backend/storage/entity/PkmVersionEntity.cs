public record PkmVersionEntity(
    string Id,
    string PkmId,
    byte Generation,
    string Filepath,
    int SchemaVersion = 0
) : IEntity(SchemaVersion, Id);
