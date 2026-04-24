using PKHeX.Core;

/**
 * Gives static-data, including pokeapi data and spritesheets.
 */
public class StaticDataService(ILogger<StaticDataService> log, ISettingsService settingsService)
{
    public static readonly EntityContext LAST_ENTITY_CONTEXT = StaticDataGenerator<object>.LAST_ENTITY_CONTEXT;

    private readonly CacheWithTiming Cache = new(log);
    private StaticEvolvesData? StaticEvolves = null;

    private readonly SpritesheetFileClient spritesheetFileClient = new();

    public async Task<StaticDataDTO> GetStaticDataDTO(string? lang = null)
    {
        lang ??= settingsService.GetSettings().GetSafeLanguage();

        var spritesheets = GetStaticSpritesheets();
        var evolves = GetStaticEvolves();
        var species = GetStaticSpecies(lang);
        var others = await GetStaticOthers(lang);

        return new(
            Versions: others.Versions,
            Species: await species,
            Stats: others.Stats,
            Types: others.Types,
            Moves: others.Moves,
            Natures: others.Natures,
            Abilities: others.Abilities,
            Items: others.Items,
            Evolves: await evolves,
            Generations: others.Generations,
            Pokedexes: others.Pokedexes,
            Ribbons: others.Ribbons,
            Languages: others.Languages,
            Spritesheets: await spritesheets,
            EggSprite: others.EggSprite
        );
    }

    public async Task<StaticEvolvesData> GetStaticEvolves()
    {
        StaticEvolves ??= await GenStaticEvolves.LoadData();

        return StaticEvolves;
    }

    public async Task<StaticSpritesheetsData> GetStaticSpritesheets()
    {
        return await GetCacheValue(
            "spritesheets",
            "",
            _ => GenStaticSpritesheets.LoadData()
        );
    }

    public async Task<StaticSpeciesData> GetStaticSpecies(string? lang = null)
    {
        return await GetCacheValue(
            "species",
            lang ?? settingsService.GetSettings().GetSafeLanguage(),
            GenStaticSpecies.LoadData
        );
    }

    public async Task<StaticOthersData> GetStaticOthers(string? lang = null)
    {
        return await GetCacheValue(
            "others",
            lang ?? settingsService.GetSettings().GetSafeLanguage(),
            GenStaticOthers.LoadData
        );
    }

    public async Task<Stream> GetSpritesheetStream(string sheetName)
    {
        return await spritesheetFileClient.GetAsyncString(sheetName);
    }

    private async Task<D> GetCacheValue<D>(string cacheKey, string lang, Func<string, Task<D>> loadFn)
    {
        var value = await Cache.GetValue<Tuple<string, D>>(
            cacheKey,
            async () => new(lang, await loadFn(lang))
        );

        if (value.Item1 != lang)
        {
            Cache.Remove(cacheKey);
            return await GetCacheValue(cacheKey, lang, loadFn);
        }

        return value.Item2;
    }

    public static GameVersion GetSingleVersion(GameVersion version) => GenStaticOthers.GetSingleVersion(version);

    public static string GetPokeapiItemName(string pkhexItemName) => GenStaticOthers.GetPokeapiItemName(pkhexItemName);

    public static int GetBallPokeApiId(Ball ball) => ball switch
    {
        Ball.None => 0,
        Ball.Master => 1,
        Ball.Ultra => 2,
        Ball.Great => 3,
        Ball.Poke => 4,
        Ball.Safari => 5,
        Ball.Net => 6,
        Ball.Dive => 7,
        Ball.Nest => 8,
        Ball.Repeat => 9,
        Ball.Timer => 10,
        Ball.Luxury => 11,
        Ball.Premier => 12,
        Ball.Dusk => 13,
        Ball.Heal => 14,
        Ball.Quick => 15,
        Ball.Cherish => 16,
        Ball.Fast => 492,
        Ball.Level => 493,
        Ball.Lure => 494,
        Ball.Heavy => 495,
        Ball.Love => 496,
        Ball.Friend => 497,
        Ball.Moon => 498,
        Ball.Sport => 499,
        Ball.Dream => 576,
        Ball.Beast => 851,
        Ball.Strange => 1785,
        Ball.LAPoke => 1710,
        Ball.LAGreat => 1711,
        Ball.LAUltra => 1712,
        Ball.LAFeather => 1713,
        Ball.LAWing => 1746,
        Ball.LAJet => 1747,
        Ball.LAHeavy => 1748,
        Ball.LALeaden => 1749,
        Ball.LAGigaton => 1750,
        Ball.LAOrigin => 1771,
        _ => 0,
    };
}
