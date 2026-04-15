public record StaticDataDTO(
    Dictionary<byte, StaticVersion> Versions,
    StaticSpeciesData Species,
    Dictionary<int, StaticStat> Stats,
    Dictionary<int, StaticType> Types,
    Dictionary<int, StaticMove> Moves,
    Dictionary<int, StaticNature> Natures,
    Dictionary<int, StaticAbility> Abilities,
    StaticItemsData Items,
    StaticEvolvesData Evolves,
    Dictionary<byte, StaticGeneration> Generations,
    Dictionary<string, StaticPokedex> Pokedexes,
    Dictionary<string, StaticRibbon> Ribbons,
    Dictionary<byte, string> Languages,
    StaticSpritesheetsData Spritesheets,
    string EggSprite
);
