public record PkmLegalityDTO(
    string Id,
    uint? SaveId,
    List<bool> MovesLegality,
    List<bool> RelearnMovesLegality,
    bool IsValid,
    string ValidityReport,
    int IllegalitiesCount
) : IWithId;
