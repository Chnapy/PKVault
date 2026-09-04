using System.Text.Json;
using System.Text.Json.Serialization;

[JsonSerializable(typeof(StaticSpritesheetsData))]
[JsonSerializable(typeof(StaticOthersData))]
[JsonSerializable(typeof(StaticEvolvesData))]
[JsonSerializable(typeof(StaticEvolve))]
[JsonSerializable(typeof(StaticEvolvesRichData))]
[JsonSerializable(typeof(StaticEvolveRich))]
[JsonSerializable(typeof(StaticSpeciesData))]
[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingDefault
)]
public partial class StaticDataJsonContext : JsonSerializerContext
{
}
