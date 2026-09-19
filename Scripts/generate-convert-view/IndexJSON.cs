public record IndexJSON(
    string[] PKTypes,
    string[] PkmVariantProperties,
    string[] PkmLegalityProperties,
    IndexEntry[] Entries
);

public record IndexEntry(
    string Id,
    ushort Species,
    byte Form
);
