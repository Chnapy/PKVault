public class PkmFileEntity
{
    public required string Filepath { get; init; }    // PK
    public required byte[] Data { get; set; }
    public required PKMLoadError? Error { get; set; }

    public required bool Updated { get; set; }
    public required bool Deleted { get; set; }
}
