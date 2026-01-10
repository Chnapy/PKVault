public class PkmEntity : IEntity
{
    public override int SchemaVersion { get; set; } = 0;

    public override required string Id { get; set; }

    public required uint BoxId { get; set; }

    public required uint BoxSlot { get; set; }

    public required uint? SaveId { get; set; }

    public override PkmEntity Clone() => new()
    {
        SchemaVersion = SchemaVersion,
        Id = Id,
        BoxId = BoxId,
        BoxSlot = BoxSlot,
        SaveId = SaveId
    };
}
