public abstract class IEntity : IWithId
{
    public abstract int SchemaVersion { get; set; }

    public abstract string Id { get; set; }

    public abstract IEntity Clone();
}
