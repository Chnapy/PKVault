
using Microsoft.Extensions.Logging;
using Serilog;

/**
 * Generator not used during classic run.
 * 
 * Generates all static data and spritesheets.
 */
public class GenStaticDataService(PokeApiService pokeApiService, IFileIOService fileIOService)
{
    public async Task GenerateFiles()
    {
        using var _ = Log.Logger.Time("-- Generate PokeApi static-data & spritesheets");

        var evolvesRich = new GenStaticEvolvesRich(pokeApiService, fileIOService).GenerateFiles();

        var bulbasaurSpeciesObj = await pokeApiService.GetPokemonSpecies(1);
        var filteredLanguages = SettingsService.AllowedLanguages.Where(lang =>
        {
            var hasBulbasaurNameForLang = bulbasaurSpeciesObj.Names.Any(n => n.Language.Name == lang);
            if (!hasBulbasaurNameForLang)
            {
                Log.Logger.Warning($"Language {lang} not available in PokeApi, generation aborted for this language.");
            }
            return hasBulbasaurNameForLang;
        });

        var species = Task.WhenAll(filteredLanguages.Select(lang =>
            new GenStaticSpecies(lang, SettingsDTO.GetLanguageForPKHeX(lang), pokeApiService, fileIOService).GenerateFiles()));

        var others = Task.WhenAll(filteredLanguages.Select(lang =>
            new GenStaticOthers(lang, SettingsDTO.GetLanguageForPKHeX(lang), pokeApiService, fileIOService).GenerateFiles()));

        var spritesheets = new GenStaticSpritesheets(fileIOService,
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
