
public record WarningsDTO(
    List<SaveChangedWarning> SaveChangedWarnings,
    List<PkmVariantWarning> PkmVariantWarnings
)
{
    public int WarningsCount { get => SaveChangedWarnings.Count + PkmVariantWarnings.Count; }
}

public record SaveChangedWarning(uint SaveId);

public record PkmVariantWarning(string PkmVariantId);
