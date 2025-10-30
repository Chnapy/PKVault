
using System.Text.Json.Serialization;

[JsonSerializable(typeof(Dictionary<string, BoxEntity>))]
[JsonSerializable(typeof(Dictionary<string, PkmEntity>))]
[JsonSerializable(typeof(Dictionary<string, PkmVersionEntity>))]
[JsonSerializable(typeof(Dictionary<string, string>))]
public partial class EntityJsonContext : JsonSerializerContext
{
}
