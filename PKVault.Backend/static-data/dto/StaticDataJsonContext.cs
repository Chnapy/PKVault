using System.Text.Json;
using System.Text.Json.Serialization;

[JsonSerializable(typeof(StaticDataDTO))]
[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase
)]
public partial class StaticDataJsonContext : JsonSerializerContext
{
}

[JsonSerializable(typeof(StaticDataDTO))]
[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    WriteIndented = true
)]
public partial class StaticDataJsonIndentedContext : JsonSerializerContext
{
}
