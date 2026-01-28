
using System.Text.Json.Serialization;

[JsonSerializable(typeof(Dictionary<string, LegacyBankEntity>))]
[JsonSerializable(typeof(Dictionary<string, LegacyBoxEntity>))]
[JsonSerializable(typeof(Dictionary<string, LegacyPkmEntity>))]
[JsonSerializable(typeof(Dictionary<string, LegacyPkmVersionEntity>))]
[JsonSerializable(typeof(Dictionary<string, LegacyDexEntity>))]
[JsonSerializable(typeof(Dictionary<string, string>))]
public partial class LegacyEntityJsonContext : JsonSerializerContext
{
}
