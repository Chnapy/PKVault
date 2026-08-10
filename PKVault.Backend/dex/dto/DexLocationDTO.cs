
using PKHeX.Core;

public record DexLocationDTO(
    ushort Species,
    EntityContext Context,
    GameVersion Version,
    // location -> encounterWithMethod -> Item[]
    Dictionary<string, Dictionary<string, List<DexLocationItem>>> Locations
);

public record DexLocationItem(
    HashSet<byte> Forms,
    string EncounterType,
    string EncounterWithMethod,
    bool IsEgg,
    bool IsShiny,
    string? Location,
    // string? EggLocation,
    HashSet<DexLevelRange> Levels,
    AbilityPermission AbilitiesAllowed
    // int? FixedBall,
    // Shiny ShinyProbability
);

public record DexLevelRange(byte LevelMin, byte LevelMax);
