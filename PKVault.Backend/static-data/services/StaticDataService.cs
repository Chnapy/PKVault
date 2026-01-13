using PKHeX.Core;

/**
 * Gives static-data, including pokeapi data and spritesheets.
 */
public class StaticDataService(SettingsService settingsService)
{
    public static readonly EntityContext LAST_ENTITY_CONTEXT = GenStaticDataService.LAST_ENTITY_CONTEXT;
    private static StaticDataDTO? staticData = null;

    private readonly SpritesheetFileClient spritesheetFileClient = new();

    public async Task<StaticDataDTO> GetStaticData()
    {
        if (staticData == null)
        {
            var client = new AssemblyClient();

            staticData = (await client.GetAsyncJsonGz(
                GenStaticDataService.GetStaticDataPathParts(settingsService.GetSettings().GetSafeLanguage()),
                StaticDataJsonContext.Default.StaticDataDTO
            ))!;
        }

        return staticData;
    }

    public static StaticDataDTO GetDefinedStaticDataDTO()
    {
        return staticData ?? throw new InvalidOperationException($"Static Data is null");
    }

    public async Task<Stream> GetSpritesheetStream(string sheetName)
    {
        return await spritesheetFileClient.GetAsyncString(sheetName);
    }

    public static GameVersion GetSingleVersion(GameVersion version) => GenStaticDataService.GetSingleVersion(version);

    public static string GetPokeapiItemName(string pkhexItemName) => GenStaticDataService.GetPokeapiItemName(pkhexItemName);

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
