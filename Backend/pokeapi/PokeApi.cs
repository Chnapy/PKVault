
using System.Text.Json;

public class PokeApi
{
    public static async Task<PokeApiPokedex> GetPokedex(PokeApiPokedexEnum pokedex)
    {
        string baseURL = $"https://pokeapi.co/api/v2/pokedex/{pokedex}/";

        using (HttpClient client = new HttpClient())
        {
            using (HttpResponseMessage res = await client.GetAsync(baseURL))
            {
                using (HttpContent content = res.Content)
                {
                    string data = await content.ReadAsStringAsync();
                    // Console.WriteLine(data);
                    if (data == default)
                    {
                        throw new Exception("Data is null!");
                    }

                    return JsonSerializer.Deserialize<PokeApiPokedex>(data);
                }
            }
        }
    }
}

public enum PokeApiPokedexEnum
{
    HOENN = 4,
}

public struct PokeApiPokedex
{
    public string name { get; set; }
    public List<PokeApiPokedexPkmEntry> pokemon_entries { get; set; }
}

public struct PokeApiPokedexPkmEntry
{
    public int entry_number { get; set; }
    public PokeApiPokedexPkmSpecies pokemon_species { get; set; }
}

public struct PokeApiPokedexPkmSpecies
{
    public string name { get; set; }
    public string url { get; set; }
}
