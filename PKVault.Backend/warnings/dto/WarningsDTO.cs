
public record WarningsDTO(
List<SaveChangedWarning> SaveChangedWarnings,
List<PkmVariantWarning> PkmVariantWarnings,
List<SaveDuplicateWarning> SaveDuplicateWarnings
)
{
    public int WarningsCount { get => SaveChangedWarnings.Count + PkmVariantWarnings.Count + SaveDuplicateWarnings.Count; }
}

public record SaveChangedWarning(uint SaveId);

public record PkmVariantWarning(string PkmVariantId);

public record SaveDuplicateWarning(uint SaveId, string[] Paths);
