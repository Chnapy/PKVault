
public class WarningsDTO
{
    public required List<PlayTimeWarning> PlayTimeWarnings { get; set; }
    public required List<PkmVersionWarning> PkmVersionWarnings { get; set; }
}

public class PlayTimeWarning
{
    public uint SaveId { get; set; }
}

public class PkmVersionWarning
{
    public required string PkmId { get; set; }
    public string? PkmVersionId { get; set; }
}
