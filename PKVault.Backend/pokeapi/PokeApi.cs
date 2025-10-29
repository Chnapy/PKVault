using PokeApiNet;

public class PokeApi
{
    public static readonly List<string?> endpointNames = [
        PokeApiFileClient.GetApiEndpointString(typeof(Pokemon)),
        PokeApiFileClient.GetApiEndpointString(typeof(PokemonSpecies)),
        PokeApiFileClient.GetApiEndpointString(typeof(PokemonForm)),
        PokeApiFileClient.GetApiEndpointString(typeof(EvolutionChain)),
        PokeApiFileClient.GetApiEndpointString(typeof(Pokedex)),
        PokeApiFileClient.GetApiEndpointString(typeof(Nature)),
        PokeApiFileClient.GetApiEndpointString(typeof(Item)),
        PokeApiFileClient.GetApiEndpointString(typeof(Move)),
        PokeApiFileClient.GetApiEndpointString(typeof(Stat)),
        PokeApiFileClient.GetApiEndpointString(typeof(PokeApiNet.Version)),
        PokeApiFileClient.GetApiEndpointString(typeof(VersionGroup)),
    ];

    private static readonly PokeApiFileClient client = new();

    public static async Task<PokemonSpecies?> GetPokemonSpecies(string speciesName)
    {
        return await client.GetAsync(speciesName,
            PokeApiJsonContext.Default.NamedApiResourceListPokemonSpecies,
            PokeApiJsonContext.Default.PokemonSpecies
        );
    }

    public static async Task<PokemonSpecies?> GetPokemonSpecies(ushort species)
    {
        return await client.GetAsync(species,
            PokeApiJsonContext.Default.PokemonSpecies
        );
    }

    public static async Task<EvolutionChain?> GetPokemonSpeciesEvolutionChain(string speciesName)
    {
        var pokemonSpecies = await GetPokemonSpecies(speciesName);
        if (pokemonSpecies == null)
        {
            return null;
        }
        return await client.GetAsync(pokemonSpecies.EvolutionChain,
            PokeApiJsonContext.Default.EvolutionChain
        );
    }

    public static async Task<List<EvolutionChain>> GetEvolutionChains()
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

    public static async Task<PokemonForm?> GetPokemonForms(NamedApiResource<PokemonForm> namedPokemonForm)
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

    public static async Task<Pokemon?> GetPokemon(int species)
    {
        return await client.GetAsync(species,
            PokeApiJsonContext.Default.Pokemon
        );
    }

    public static async Task<Pokemon?> GetPokemon(NamedApiResource<Pokemon> namedPokemon)
    {
        return await client.GetAsync(namedPokemon,
            PokeApiJsonContext.Default.Pokemon
        );
    }

    public static async Task<Nature?> GetNature(string natureName)
    {
        return await client.GetAsync(natureName,
            PokeApiJsonContext.Default.NamedApiResourceListNature,
            PokeApiJsonContext.Default.Nature
        );
    }

    public static async Task<Pokedex?> GetPokedex(PokeApiPokedexEnum pokedex)
    {
        return await client.GetAsync((int)pokedex,
            PokeApiJsonContext.Default.Pokedex
        );
    }

    public static async Task<Item?> GetItem(int id)
    {
        return await client.GetAsync(id,
            PokeApiJsonContext.Default.Item
        );
    }

    public static async Task<Item?> GetItem(string name)
    {
        return await client.GetAsync(name,
            PokeApiJsonContext.Default.NamedApiResourceListItem,
            PokeApiJsonContext.Default.Item
        );
    }

    public static async Task<Move?> GetMove(int id)
    {
        return await client.GetAsync(id,
            PokeApiJsonContext.Default.Move
        );
    }

    public static async Task<Stat?> GetStat(int id)
    {
        return await client.GetAsync(id,
            PokeApiJsonContext.Default.Stat
        );
    }

    public static async Task<VersionGroup?> GetVersionGroup(NamedApiResource<VersionGroup> namedVersionGroup)
    {
        return await client.GetAsync(namedVersionGroup,
            PokeApiJsonContext.Default.VersionGroup
        );
    }

    public static async Task<PokeApiNet.Version?> GetVersion(int id)
    {
        return await client.GetAsync(id,
            PokeApiJsonContext.Default.Version
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
            ?? throw new Exception($"Language not handled: {lang}");
    }
}
