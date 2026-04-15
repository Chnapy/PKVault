using System.Text.Json;
using System.Text.Json.Serialization;

[JsonSerializable(typeof(StaticSpritesheetsData))]
[JsonSerializable(typeof(StaticOthersData))]
[JsonSerializable(typeof(StaticEvolvesData))]
[JsonSerializable(typeof(StaticSpeciesData))]
[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase
)]
public partial class StaticDataJsonContext : JsonSerializerContext
{
}
