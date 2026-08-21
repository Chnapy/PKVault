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

        var evolvesRich = new GenStaticEvolvesRich(log, pokeApiService, fileIOService).GenerateFiles();

        var bulbasaurSpeciesObj = await pokeApiService.GetPokemonSpecies(1);
        var filteredLanguages = SettingsService.AllowedLanguages
            .Select(lang => lang.ToLower())
            .Where(lang =>
            {
                var hasBulbasaurNameForLang = bulbasaurSpeciesObj.Names.Any(n => n.Language.Name == lang);
                if (!hasBulbasaurNameForLang)
                {
                    log.LogWarning($"Language {lang} not available in PokeApi, generation aborted for this language.");
                }
                return hasBulbasaurNameForLang;
            });

        var species = Task.WhenAll(filteredLanguages.Select(lang =>
            new GenStaticSpecies(log, lang, pokeApiService, fileIOService).GenerateFiles()));

        var others = Task.WhenAll(filteredLanguages.Select(lang =>
            new GenStaticOthers(log, lang, pokeApiService, fileIOService).GenerateFiles()));

        var spritesheets = new GenStaticSpritesheets(log, fileIOService,
            (await species)[0],
            [.. (await others)[0].Items.Items.Values]
        ).GenerateFiles();

        await Task.WhenAll([
            evolvesRich,
            species,
            others,
            spritesheets,
        ]);
    }
}
