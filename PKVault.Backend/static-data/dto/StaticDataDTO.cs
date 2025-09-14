
using PKHeX.Core;

public class StaticDataDTO
{
    public required Dictionary<int, StaticVersion> Versions { get; set; }
    public required Dictionary<int, StaticSpecies> Species { get; set; }
    public required Dictionary<int, StaticStat> Stats { get; set; }
    public required Dictionary<int, StaticType> Types { get; set; }
    public required Dictionary<int, StaticMove> Moves { get; set; }
    public required Dictionary<int, StaticNature> Natures { get; set; }
    public required Dictionary<int, StaticAbility> Abilities { get; set; }
    public required Dictionary<int, StaticItem> Items { get; set; }
}

public struct StaticVersion
{
    public required GameVersion Id { get; set; }
    public required string Name { get; set; }
    public required byte Generation { get; set; }
    public required int MaxSpeciesId { get; set; }
    public required int MaxIV { get; set; }
    public required int MaxEV { get; set; }
}

public struct StaticSpecies
{
    public required int Id { get; set; }
    public required string Name { get; set; }
    public required uint Generation { get; set; }
    public required GenderType[] Genders { get; set; }
    public required string SpriteDefault { get; set; }
    public required string SpriteShiny { get; set; }
    // public int[] AvailableMoves { get; set; }
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
    public required uint UntilGeneration { get; set; }
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

public enum MoveCategory
{
    PHYSICAL,
    SPECIAL,
    STATUS
}

public enum GenderType
{
    MALE,
    FEMALE,
}
