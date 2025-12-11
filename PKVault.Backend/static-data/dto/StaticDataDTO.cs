
using PKHeX.Core;

public class StaticDataDTO
{
    public required Dictionary<byte, StaticVersion> Versions { get; set; }
    public required Dictionary<ushort, StaticSpecies> Species { get; set; }
    public required Dictionary<int, StaticStat> Stats { get; set; }
    public required Dictionary<int, StaticType> Types { get; set; }
    public required Dictionary<int, StaticMove> Moves { get; set; }
    public required Dictionary<int, StaticNature> Natures { get; set; }
    public required Dictionary<int, StaticAbility> Abilities { get; set; }
    public required Dictionary<int, StaticItem> Items { get; set; }
    public required Dictionary<ushort, StaticEvolve> Evolves { get; set; }
    public required Dictionary<byte, StaticGeneration> Generations { get; set; }
    public required StaticSpritesheets Spritesheets { get; set; }
    public required string EggSprite { get; set; }
}

public struct StaticVersion
{
    public required byte Id { get; set; }
    public required string Name { get; set; }
    public required byte Generation { get; set; }
    public required string[] Region { get; set; }
    public required int MaxSpeciesId { get; set; }
    public required int MaxIV { get; set; }
    public required int MaxEV { get; set; }
}

public struct StaticSpecies
{
    public required ushort Id { get; set; }
    // public required string Name { get; set; }
    public required byte Generation { get; set; }
    public required Gender[] Genders { get; set; }
    // key is EntityContext
    public required Dictionary<byte, StaticSpeciesForm[]> Forms { get; set; }
    // public required string SpriteDefault { get; set; }
    // public required string SpriteShiny { get; set; }
    // public int[] AvailableMoves { get; set; }
}

public struct StaticSpeciesForm
{
    public required int Id { get; set; }
    public required string Name { get; set; }
    public required string SpriteDefault { get; set; }
    public required string? SpriteFemale { get; set; }
    public required string SpriteShiny { get; set; }
    public required string? SpriteShinyFemale { get; set; }
    public required string? SpriteShadow { get; set; }
    public required bool HasGenderDifferences { get; set; }
    public required bool IsBattleOnly { get; set; }
}

public struct StaticStat
{
    public required int Id { get; set; }
    public required string Name { get; set; }
}

public struct StaticType
{
    public required int Id { get; set; }
    public required string Name { get; set; }
}

public struct StaticMove
{
    public required int Id { get; set; }
    public required string Name { get; set; }
    public required StaticMoveGeneration[] DataUntilGeneration { get; set; }
}

public struct StaticMoveGeneration
{
    public required byte UntilGeneration { get; set; }
    public required int Type { get; set; }
    public required MoveCategory Category { get; set; }
    public required int? Power { get; set; }
}

public struct StaticNature
{
    public required int Id { get; set; }
    public required string Name { get; set; }
    public required int? IncreasedStatIndex { get; set; }
    public required int? DecreasedStatIndex { get; set; }
}

public struct StaticAbility
{
    public required int Id { get; set; }
    public required string Name { get; set; }
}

public struct StaticItem
{
    public required int Id { get; set; }
    public required string Name { get; set; }
    public required string Sprite { get; set; }
}

public struct StaticEvolve
{
    public record StaticEvolveItem(ushort EvolveSpecies, int MinLevel);

    public required ushort Species { get; set; }
    // version -> (evolved species, min-level)
    public required Dictionary<byte, StaticEvolveItem> Trade { get; set; }
    // item -> version -> (evolved species, min-level)
    public required Dictionary<string, Dictionary<byte, StaticEvolveItem>> TradeWithItem { get; set; }
}

public struct StaticGeneration
{
    public required int Id { get; set; }
    public required string[] Regions { get; set; }
}

public record StaticSpritesheets
(
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
