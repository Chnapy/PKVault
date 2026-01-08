
public class WarningsDTO
{
    public required List<SaveChangedWarning> SaveChangedWarnings { get; set; }
    public required List<PlayTimeWarning> PlayTimeWarnings { get; set; }
    public required List<PkmVersionWarning> PkmVersionWarnings { get; set; }
    public required List<SaveDuplicateWarning> SaveDuplicateWarnings { get; set; }

    public int WarningsCount { get => SaveChangedWarnings.Count + PlayTimeWarnings.Count + PkmVersionWarnings.Count + SaveDuplicateWarnings.Count; }
}

public class SaveChangedWarning
{
    public uint SaveId { get; set; }
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

public class SaveDuplicateWarning
{
    public required uint SaveId { get; set; }
    public required string[] Paths { get; set; }
}
