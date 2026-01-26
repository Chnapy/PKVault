public record SavePkmEntity(
    string Id,  // index
    string IdBase,  // index
    uint SaveId,    // index
    string BoxId,  // index
    int BoxSlot, // index
    byte[] Data,

    bool Updated,
    bool Deleted
);
