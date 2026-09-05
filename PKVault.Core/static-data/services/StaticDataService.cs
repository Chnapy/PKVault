using PKHeX.Core;

namespace PKVault.Core;

/**
 * Gives static-data, including pokeapi data and spritesheets.
 */
public class StaticDataService(ISettingsService settingsService)
{
    public static readonly EntityContext LAST_ENTITY_CONTEXT = EntityContext.Gen9a;

    private readonly CacheWithTiming Cache = new();
    private StaticEvolvesData? StaticEvolves = null;

    private readonly SpritesheetFileClient spritesheetFileClient = new();

    public async Task<StaticDataDTO> GetStaticDataDTO(string? lang = null)
    {
        lang ??= settingsService.GetSettings().GetLanguageOrDefault();

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
        StaticEvolves ??= await StaticEvolvesLoader.LoadData();

        return StaticEvolves;
    }

    public async Task<StaticSpritesheetsData> GetStaticSpritesheets()
    {
        return await GetCacheValue(
            "spritesheets",
            "",
            _ => StaticSpritesheetsLoader.LoadData()
        );
    }

    public async Task<StaticSpeciesData> GetStaticSpecies(string? lang = null)
    {
        return await GetCacheValue(
            "species",
            lang ?? settingsService.GetSettings().GetLanguageOrDefault(),
            StaticSpeciesLoader.LoadData
        );
    }

    public async Task<StaticOthersData> GetStaticOthers(string? lang = null)
    {
        return await GetCacheValue(
            "others",
            lang ?? settingsService.GetSettings().GetLanguageOrDefault(),
            StaticOthersLoader.LoadData
        );
    }

    public async Task<StaticEvolvesRichData> GetStaticEvolvesRich()
    {
        return await GetCacheValue(
            "evolves-rich",
            "",
            _ => StaticEvolvesRichLoader.LoadData()
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
}
