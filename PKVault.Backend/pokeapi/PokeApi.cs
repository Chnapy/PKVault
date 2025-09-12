using PokeApiNet;

public class PokeApi
{
    public static readonly List<string?> endpointNames = [
        PokeApiFileClient.GetApiEndpointString<Pokemon>(),
        PokeApiFileClient.GetApiEndpointString<PokemonSpecies>(),
        PokeApiFileClient.GetApiEndpointString<EvolutionChain>(),
        PokeApiFileClient.GetApiEndpointString<Pokedex>(),
        PokeApiFileClient.GetApiEndpointString<Nature>(),
        PokeApiFileClient.GetApiEndpointString<Item>(),
        PokeApiFileClient.GetApiEndpointString<Move>(),
        PokeApiFileClient.GetApiEndpointString<Stat>(),
        PokeApiFileClient.GetApiEndpointString<PokeApiNet.Version>(),
        PokeApiFileClient.GetApiEndpointString<VersionGroup>(),
    ];

    private static readonly PokeApiFileClient client = new();

    public static async Task<PokemonSpecies?> GetPokemonSpecies(string speciesName)
    {
        return await client.GetAsync<PokemonSpecies>(speciesName);
    }

    public static async Task<PokemonSpecies?> GetPokemonSpecies(int species)
    {
        return await client.GetAsync<PokemonSpecies>(species);
    }

    public static async Task<EvolutionChain?> GetPokemonSpeciesEvolutionChain(string speciesName)
    {
        var pokemonSpecies = await GetPokemonSpecies(speciesName);
        if (pokemonSpecies == null)
        {
            return null;
        }
        return await client.GetAsync(pokemonSpecies.EvolutionChain);
    }

    public static async Task<Pokemon?> GetPokemon(int species)
    {
        return await client.GetAsync<Pokemon>(species);
    }

    public static async Task<Nature?> GetNature(string natureName)
    {
        return await client.GetAsync<Nature>(natureName);
    }

    public static async Task<Pokedex> GetPokedex(PokeApiPokedexEnum pokedex)
    {
        return await client.GetAsync<Pokedex>((int)pokedex);
    }

    public static async Task<Item> GetItem(int id)
    {
        return await client.GetAsync<Item>(id);
    }

    public static async Task<Item> GetItem(string name)
    {
        return await client.GetAsync<Item>(name);
    }

    public static async Task<Move> GetMove(int id)
    {
        return await client.GetAsync<Move>(id);
    }

    public static async Task<Stat> GetStat(int id)
    {
        return await client.GetAsync<Stat>(id);
    }

    public static async Task<VersionGroup> GetVersionGroup(NamedApiResource<VersionGroup> namedVersionGroup)
    {
        return await client.GetAsync(namedVersionGroup);
    }

    public static async Task<PokeApiNet.Version> GetVersion(int id)
    {
        return await client.GetAsync<PokeApiNet.Version>(id);
    }

    public static uint GetGenerationValue(string resourceName)
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
}
