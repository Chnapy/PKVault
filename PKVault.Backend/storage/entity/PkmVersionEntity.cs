public class PkmVersionEntity : IEntity
{
    public override int SchemaVersion { get; set; } = 0;

    public override required string Id { get; set; }

    public required string PkmId { get; set; }

    public required byte Generation { get; set; }

    // public uint? SaveId { get; set; }

    public required string Filepath { get; set; }

    public override PkmVersionEntity Clone() => new()
    {
        SchemaVersion = SchemaVersion,
        Id = Id,
        PkmId = PkmId,
        Generation = Generation,
        Filepath = Filepath
    };
}
