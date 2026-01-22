
public record WarningsDTO(
List<SaveChangedWarning> SaveChangedWarnings,
List<PkmVersionWarning> PkmVersionWarnings,
List<SaveDuplicateWarning> SaveDuplicateWarnings
)
{
    public int WarningsCount { get => SaveChangedWarnings.Count + PkmVersionWarnings.Count + SaveDuplicateWarnings.Count; }
}

public record SaveChangedWarning(uint SaveId);

public record PkmVersionWarning(string PkmVersionId);

public record SaveDuplicateWarning(uint SaveId, string[] Paths);
