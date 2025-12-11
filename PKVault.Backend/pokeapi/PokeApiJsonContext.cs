using System.Text.Json;
using System.Text.Json.Serialization;
using PokeApiNet;

[JsonSerializable(typeof(Pokemon))]
[JsonSerializable(typeof(PokemonSpecies))]
[JsonSerializable(typeof(PokemonForm))]
[JsonSerializable(typeof(EvolutionChain))]
[JsonSerializable(typeof(Pokedex))]
[JsonSerializable(typeof(Nature))]
[JsonSerializable(typeof(Item))]
[JsonSerializable(typeof(Move))]
[JsonSerializable(typeof(Stat))]
[JsonSerializable(typeof(PokeApiNet.Version))]
[JsonSerializable(typeof(VersionGroup))]
[JsonSerializable(typeof(Generation))]
[JsonSerializable(typeof(Region))]

[JsonSerializable(typeof(NamedApiResourceList<Pokemon>))]
[JsonSerializable(typeof(NamedApiResourceList<PokemonSpecies>))]
[JsonSerializable(typeof(NamedApiResourceList<PokemonForm>))]
[JsonSerializable(typeof(ApiResourceList<EvolutionChain>))]
[JsonSerializable(typeof(NamedApiResourceList<Pokedex>))]
[JsonSerializable(typeof(NamedApiResourceList<Nature>))]
[JsonSerializable(typeof(NamedApiResourceList<Item>))]
[JsonSerializable(typeof(NamedApiResourceList<Move>))]
[JsonSerializable(typeof(NamedApiResourceList<Stat>))]
[JsonSerializable(typeof(NamedApiResourceList<PokeApiNet.Version>))]
[JsonSerializable(typeof(NamedApiResourceList<VersionGroup>))]
[JsonSerializable(typeof(NamedApiResourceList<Generation>))]
[JsonSerializable(typeof(NamedApiResourceList<Region>))]

[JsonSerializable(typeof(PokemonSprites.VersionSprites.GenerationVIIISprites.IconsSprites),
GenerationMode = JsonSourceGenerationMode.Default, TypeInfoPropertyName = "PokemonSpritesVersionSpritesGenerationVIIISpritesIconsSprites")]

[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.SnakeCaseLower,
    PropertyNameCaseInsensitive = true,
    DefaultBufferSize = 16 * 1024 // buffer 16 Ko
)]
[JsonConverter(typeof(NumberToStringConverter))]
public partial class PokeApiJsonContext : JsonSerializerContext
{
}
