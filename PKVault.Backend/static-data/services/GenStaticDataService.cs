/**
 * Generator not used during classic run.
 * 
 * Generates all static data and spritesheets.
 */
public class GenStaticDataService(ILogger<GenStaticDataService> log, PokeApiService pokeApiService, IFileIOService fileIOService)
{
    public async Task GenerateFiles()
    {
        using var _ = log.Time("-- Generate PokeApi static-data & spritesheets");

        var evolves = new GenStaticEvolves(log, pokeApiService, fileIOService).GenerateFiles();

        var species = Task.WhenAll(SettingsService.AllowedLanguages.Select(lang =>
            new GenStaticSpecies(log, lang, pokeApiService, fileIOService).GenerateFiles()));

        var others = Task.WhenAll(SettingsService.AllowedLanguages.Select(lang =>
            new GenStaticOthers(log, lang, pokeApiService, fileIOService).GenerateFiles()));

        var spritesheets = new GenStaticSpritesheets(log, fileIOService,
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
