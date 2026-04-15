/**
 * Generator not used during classic run.
 * 
 * Generates all static data and spritesheets.
 */
public class GenStaticDataService(PokeApiService pokeApiService, IFileIOService fileIOService)
{
    public async Task GenerateFiles()
    {
        using var _ = LogUtil.Time("-- Generate PokeApi static-data & spritesheets");

        var evolves = new GenStaticEvolves(pokeApiService, fileIOService).GenerateFiles();

        var species = Task.WhenAll(SettingsService.AllowedLanguages.Select(lang =>
            new GenStaticSpecies(lang, pokeApiService, fileIOService).GenerateFiles()));

        var others = Task.WhenAll(SettingsService.AllowedLanguages.Select(lang =>
            new GenStaticOthers(lang, pokeApiService, fileIOService).GenerateFiles()));

        var spritesheets = new GenStaticSpritesheets(fileIOService,
            (await species)[0],
            [.. (await others)[0].Items.Items.Values]
        ).GenerateFiles();

        await Task.WhenAll([
            evolves,
            species,
            others,
            spritesheets,
        ]);
    }
}
