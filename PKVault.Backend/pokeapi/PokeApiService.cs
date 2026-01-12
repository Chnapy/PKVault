using PokeApiNet;

/**
 * Data fetcher not used during classic run.
 * 
 * Gives pokeapi data from local json files.
 */
public class PokeApiService
{
    private readonly PokeApiFileClient client = new();

    // public static async Task<PokemonSpecies?> GetPokemonSpecies(string speciesName)
    // {
    //     return await client.GetAsync(speciesName,
    //         PokeApiJsonContext.Default.NamedApiResourceListPokemonSpecies,
    //         PokeApiJsonContext.Default.PokemonSpecies
    //     );
    // }

    public async Task<PokemonSpecies?> GetPokemonSpecies(ushort species)
    {
        return await client.GetAsync(species,
            PokeApiJsonContext.Default.PokemonSpecies
        );
    }

    // public static async Task<EvolutionChain?> GetPokemonSpeciesEvolutionChain(string speciesName)
    // {
    //     var pokemonSpecies = await GetPokemonSpecies(speciesName);
    //     if (pokemonSpecies == null)
    //     {
    //         return null;
    //     }
    //     return await client.GetAsync(pokemonSpecies.EvolutionChain,
    //         PokeApiJsonContext.Default.EvolutionChain
    //     );
    // }

    public async Task<List<EvolutionChain>> GetEvolutionChains()
    {
        var evolutionChainsUrls = await client.GetAsyncUrlList(
            PokeApiJsonContext.Default.ApiResourceListEvolutionChain,
            PokeApiJsonContext.Default.EvolutionChain
        );
        return [.. (await Task.WhenAll(evolutionChainsUrls
            .Select(apiResource => client.GetAsync(apiResource,
                PokeApiJsonContext.Default.EvolutionChain
            ))
        )).OfType<EvolutionChain>()];
    }

    public async Task<PokemonForm?> GetPokemonForms(NamedApiResource<PokemonForm> namedPokemonForm)
    {
        return await client.GetAsync(namedPokemonForm,
            PokeApiJsonContext.Default.PokemonForm
        );
    }

    // public static async Task<List<PokemonForm>> GetPokemonFormsStartingWith(string prefix)
    // {
    //     var results = await client.GetAsyncList<PokemonForm>();
    //     return [.. (await Task.WhenAll(results
    //         .FindAll(apiResource => apiResource.Name.StartsWith(prefix))
    //         .Select(apiResource => client.GetAsync(apiResource))))
    //         .OfType<PokemonForm>()];
    // }

    // public static async Task<Pokemon?> GetPokemon(int species)
    // {
    //     return await client.GetAsync(species,
    //         PokeApiJsonContext.Default.Pokemon
    //     );
    // }

    public async Task<Pokemon?> GetPokemon(NamedApiResource<Pokemon> namedPokemon)
    {
        return await client.GetAsync(namedPokemon,
            PokeApiJsonContext.Default.Pokemon
        );
    }

    public async Task<Nature?> GetNature(string natureName)
    {
        return await client.GetAsync(natureName,
            PokeApiJsonContext.Default.NamedApiResourceListNature,
            PokeApiJsonContext.Default.Nature
        );
    }

    public async Task<Pokedex?> GetPokedex(PokeApiPokedexEnum pokedex)
    {
        return await client.GetAsync((int)pokedex,
            PokeApiJsonContext.Default.Pokedex
        );
    }

    // public static async Task<Item?> GetItem(int id)
    // {
    //     return await client.GetAsync(id,
    //         PokeApiJsonContext.Default.Item
    //     );
    // }

    public async Task<Item?> GetItem(string name)
    {
        return await client.GetAsync(name,
            PokeApiJsonContext.Default.NamedApiResourceListItem,
            PokeApiJsonContext.Default.Item
        );
    }

    public async Task<Move?> GetMove(int id)
    {
        return await client.GetAsync(id,
            PokeApiJsonContext.Default.Move
        );
    }

    public async Task<Stat?> GetStat(int id)
    {
        return await client.GetAsync(id,
            PokeApiJsonContext.Default.Stat
        );
    }

    public async Task<VersionGroup?> GetVersionGroup(NamedApiResource<VersionGroup> namedVersionGroup)
    {
        return await client.GetAsync(namedVersionGroup,
            PokeApiJsonContext.Default.VersionGroup
        );
    }

    public async Task<PokeApiNet.Version?> GetVersion(int id)
    {
        return await client.GetAsync(id,
            PokeApiJsonContext.Default.Version
        );
    }

    public async Task<Region?> GetRegion(int id)
    {
        return await client.GetAsync(id,
            PokeApiJsonContext.Default.Region
        );
    }

    public async Task<Region?> GetRegion(NamedApiResource<Region> namedRegion)
    {
        return await client.GetAsync(namedRegion,
            PokeApiJsonContext.Default.Region
        );
    }

    public static byte GetGenerationValue(string resourceName)
    {
        return resourceName switch
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

    public static int GetIdFromUrl(string url)
    {
        return int.Parse(url.TrimEnd('/').Split('/')[^1]);
    }

    public static string GetNameForLang(List<Names> names, string lang)
    {
        return names.Find(name => name.Language.Name == lang)?.Name
            ?? names.Find(name => name.Language.Name == "en")?.Name
            ?? throw new Exception($"Language not handled: {lang}");
    }
}
