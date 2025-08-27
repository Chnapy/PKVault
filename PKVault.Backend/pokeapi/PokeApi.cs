using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using PokeApiNet;

public partial class PokeApi
{
    private static readonly PokeApiClient pokeClient = new();

    public static async Task<PokemonSpecies?> GetPokemonSpecies(string speciesNameRaw)
    {
        var speciesName = PokeApiNameFromPKHexName(speciesNameRaw);

        try
        {
            return await pokeClient.GetResourceAsync<PokemonSpecies>(speciesName);
        }
        catch
        {
            Console.WriteLine($"THROW ERROR for param= {speciesName} / {speciesNameRaw}");
            return null;
            // throw;
        }
    }

    public static async Task<EvolutionChain?> GetPokemonSpeciesEvolutionChain(string speciesNameRaw)
    {
        var pokemonSpecies = await GetPokemonSpecies(speciesNameRaw);
        if (pokemonSpecies == null)
        {
            return null;
        }
        return await pokeClient.GetResourceAsync(pokemonSpecies.EvolutionChain);
    }

    public static async Task<Pokemon?> GetPokemon(int species)
    {
        try
        {
            return await pokeClient.GetResourceAsync<Pokemon>(species);
        }
        catch
        {
            Console.WriteLine($"THROW ERROR for param= {species}");
            return null;
            // throw;
        }
    }

    public static async Task<Nature?> GetNature(string natureNameRaw)
    {
        var natureName = PokeApiNameFromPKHexName(natureNameRaw);

        try
        {
            return await pokeClient.GetResourceAsync<Nature>(natureName);
        }
        catch
        {
            Console.WriteLine($"THROW ERROR for param= {natureName} / {natureNameRaw}");
            return null;
            // throw;
        }
    }

    public static async Task<Pokedex> GetPokedex(PokeApiPokedexEnum pokedex)
    {
        return await pokeClient.GetResourceAsync<Pokedex>((int)pokedex);
    }

    public static async Task<Item> GetItem(int id)
    {
        return await pokeClient.GetResourceAsync<Item>(id);
    }

    public static string PokeApiNameFromPKHexName(string pkhexName)
    {
        static string RemoveDiacritics(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return text;

            var normalizedString = text.Normalize(NormalizationForm.FormD);
            var stringBuilder = new StringBuilder();

            foreach (var c in normalizedString)
            {
                var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
                if (unicodeCategory != UnicodeCategory.NonSpacingMark)
                    stringBuilder.Append(c);
            }

            return stringBuilder.ToString().Normalize(NormalizationForm.FormC);
        }

        if (pkhexName.Contains('('))
        {
            return pkhexName;
            // throw new Exception($"PKHex string not handled: {pkhexName}");
        }

        var result = PascalCaseRegex().Replace(pkhexName, "$1-$2");
        result = SpaceRegex().Replace(result, "-").ToLower();
        result = RemoveDiacritics(result);
        result = result.Replace("♀", "-f").Replace("♂", "-m");
        result = PonctuRegex().Replace(result, "");

        return result;
    }

    public static uint GetGenerationValue(NamedApiResource<Generation> generationResource)
    {
        return generationResource.Name switch
        {
            "generation-i" => 1,
            "generation-ii" => 2,
            "generation-iii" => 3,
            "generation-iv" => 4,
            "generation-v" => 5,
            "generation-vi" => 6,
            "generation-vii" => 7,
            "generation-viii" => 8,
            "generation-ix" => 9,
            _ => throw new Exception("Generation name not handled")
        };
    }

    public static void ClearCache()
    {
        Console.WriteLine($"Clear PokeApi cache");
        pokeClient.ClearCache();
    }

    [GeneratedRegex("([a-z])([A-Z])")]
    private static partial Regex PascalCaseRegex();

    [GeneratedRegex(@"\s+")]
    private static partial Regex SpaceRegex();

    [GeneratedRegex(@"[’'`´]+")]
    private static partial Regex PonctuRegex();
}

public enum PokeApiPokedexEnum
{
    HOENN = 4,
}
