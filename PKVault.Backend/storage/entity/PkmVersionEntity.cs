public class PkmVersionEntity : IEntity
{
    public int SchemaVersion { get; set; } = 0;

    public required string Id { get; set; }

    public required string PkmId { get; set; }

    public required byte Generation { get; set; }

    // public uint? SaveId { get; set; }

    public required string Filepath { get; set; }
}
