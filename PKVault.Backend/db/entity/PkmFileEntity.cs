public record PkmFileEntity(
    string Filepath,    // index
    byte[] Data,
    PKMLoadError? Error,

    bool Updated,
    bool Deleted
);
