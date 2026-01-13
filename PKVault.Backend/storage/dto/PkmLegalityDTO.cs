public record PkmLegalityDTO(
    string Id,
    uint? SaveId,
    List<bool> MovesLegality,
    bool IsValid,
    string ValidityReport
) : IWithId;
