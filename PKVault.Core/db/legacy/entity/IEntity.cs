public abstract record ILegacyEntity(
    int SchemaVersion,
    string Id
) : IWithId;
