using System.Text.Json;
using System.Text.Json.Serialization;

[JsonSerializable(typeof(Dictionary<string, SpriteInfo>))]
[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    PropertyNameCaseInsensitive = true,
    DefaultBufferSize = 16 * 1024 // buffer 16 Ko
)]
public partial class SpritesheetJsonContext : JsonSerializerContext
{
}
