
public record WarningsDTO(
    List<SaveChangedWarning> SaveChangedWarnings,
    List<PkmVariantWarning> PkmVariantWarnings,
    SaveDuplicateWarning[] SaveDuplicateWarnings
)
{
    public int WarningsCount { get => SaveChangedWarnings.Count + PkmVariantWarnings.Count + SaveDuplicateWarnings.Length; }
}

public record SaveChangedWarning(uint SaveId);

public record PkmVariantWarning(string PkmVariantId);

public record SaveDuplicateWarning(uint SaveId, string[] Paths);
