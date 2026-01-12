
using PKHeX.Core;

public record StaticDataDTO(
Dictionary<byte, StaticVersion> Versions,
Dictionary<ushort, StaticSpecies> Species,
Dictionary<int, StaticStat> Stats,
Dictionary<int, StaticType> Types,
Dictionary<int, StaticMove> Moves,
Dictionary<int, StaticNature> Natures,
Dictionary<int, StaticAbility> Abilities,
Dictionary<int, StaticItem> Items,
Dictionary<ushort, StaticEvolve> Evolves,
Dictionary<byte, StaticGeneration> Generations,
StaticSpritesheets Spritesheets,
string EggSprite
);

public record StaticVersion(
byte Id,
string Name,
byte Generation,
string[] Region,
int MaxSpeciesId,
int MaxIV,
int MaxEV
);

public record StaticSpecies(
    ushort Id,
    byte Generation,
    Gender[] Genders,
    // key is EntityContext
    Dictionary<byte, StaticSpeciesForm[]> Forms,
    bool IsInHoennDex
);

public record StaticSpeciesForm(
int Id,
string Name,
string SpriteDefault,
string? SpriteFemale,
string SpriteShiny,
string? SpriteShinyFemale,
string? SpriteShadow,
bool HasGenderDifferences,
bool IsBattleOnly
);

public record StaticStat(
    int Id,
    string Name
);

public record StaticType(
    int Id,
    string Name
);

public record StaticMove(
    int Id,
    string Name,
    StaticMoveGeneration[] DataUntilGeneration
);

public record StaticMoveGeneration(
byte UntilGeneration,
int Type,
MoveCategory Category,
int? Power
);

public record StaticNature(
    int Id,
    string Name,
    int? IncreasedStatIndex,
int? DecreasedStatIndex
);

public record StaticAbility(
    int Id,
    string Name
);

public record StaticItem(
    int Id,
    string Name,
    string Sprite
);

public record StaticEvolve(
    ushort Species,
    // version -> (evolved species, min-level)
    Dictionary<byte, StaticEvolve.StaticEvolveItem> Trade,
    // item -> version -> (evolved species, min-level)
    Dictionary<string, Dictionary<byte, StaticEvolve.StaticEvolveItem>> TradeWithItem,
    Dictionary<byte, List<StaticEvolve.StaticEvolveItem>> Other
)
{
    public record StaticEvolveItem(ushort EvolveSpecies, int MinLevel);

    public ushort? PreviousSpecies { get; set; }
}

public record StaticGeneration(
    int Id,
    string[] Regions
);

public record StaticSpritesheets(
    Dictionary<string, SpriteInfo> Species,
Dictionary<string, SpriteInfo> Items
);

public record SpriteInfo(string SheetName, int X, int Y, int Width, int Height);

public enum MoveCategory
{
    PHYSICAL,
    SPECIAL,
    STATUS
}
