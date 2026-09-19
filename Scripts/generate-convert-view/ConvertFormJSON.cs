
using PKVault.Core;

public record ConvertFormJSON(
    string Id,
    ushort Species,
    byte Form,
    // public required string SpeciesName;
    List<Tuple<ConvertDirection, ConvertStep[]>> Paths,
    HashSet<string> MissingSavePkmTypes,
    HashSet<string> MissingSavePkmsPresent
);

public record ConvertStep(
    string Id,
    string Type,    // PK1 etc
    bool Ok,
    string? Error,
    PkmVariantDTO? PkmVariant,
    PkmLegalityDTO? PkmLegality
);

public enum ConvertDirection
{
    FORWARD,
    BACKWARD,
    BASE_TO_VARIANT,
    VARIANT_TO_BASE,
}
