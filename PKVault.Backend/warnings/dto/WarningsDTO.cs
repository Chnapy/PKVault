
public class WarningsDTO
{
    public required List<PlayTimeWarning> playTimeWarnings { get; set; }
    public required List<PkmVersionWarning> pkmVersionWarnings { get; set; }
}

public struct PlayTimeWarning
{
    public uint SaveId { get; set; }
}

public struct PkmVersionWarning
{
    public string PkmVersionId { get; set; }
}
