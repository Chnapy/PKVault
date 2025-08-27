public class PkmVersionEntity : IWithId<string>
{
    public required string Id { get; set; }

    public required string PkmId { get; set; }

    public required uint Generation { get; set; }

    // public uint? SaveId { get; set; }

    public required string Filepath { get; set; }
}
