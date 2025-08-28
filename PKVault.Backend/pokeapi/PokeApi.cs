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
    ];

    private static readonly PokeApiFileClient client = new();

    public static async Task<PokemonSpecies?> GetPokemonSpecies(string speciesNameRaw)
    {
        return await client.GetAsync<PokemonSpecies>(speciesNameRaw);
    }

    public static async Task<EvolutionChain?> GetPokemonSpeciesEvolutionChain(string speciesNameRaw)
    {
        var pokemonSpecies = await GetPokemonSpecies(speciesNameRaw);
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

    public static async Task<Nature?> GetNature(string natureNameRaw)
    {
        return await client.GetAsync<Nature>(natureNameRaw);
    }

    public static async Task<Pokedex> GetPokedex(PokeApiPokedexEnum pokedex)
    {
        return await client.GetAsync<Pokedex>((int)pokedex);
    }

    public static async Task<Item> GetItem(int id)
    {
        return await client.GetAsync<Item>(id);
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
}
