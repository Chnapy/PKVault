
public record WarningsDTO(
List<SaveChangedWarning> SaveChangedWarnings,
List<PlayTimeWarning> PlayTimeWarnings,
List<PkmVersionWarning> PkmVersionWarnings,
List<SaveDuplicateWarning> SaveDuplicateWarnings
)
{
    public int WarningsCount { get => SaveChangedWarnings.Count + PlayTimeWarnings.Count + PkmVersionWarnings.Count + SaveDuplicateWarnings.Count; }
}

public record SaveChangedWarning(uint SaveId);

public record PlayTimeWarning(uint SaveId);

public record PkmVersionWarning(string PkmId, string? PkmVersionId = null);

public record SaveDuplicateWarning(uint SaveId, string[] Paths);
