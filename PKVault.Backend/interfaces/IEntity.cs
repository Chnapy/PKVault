public abstract record IEntity(
    int SchemaVersion,
    string Id
) : IWithId;
