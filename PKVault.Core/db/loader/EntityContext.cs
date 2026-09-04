
using System.Text.Json.Serialization;

[JsonSerializable(typeof(Dictionary<string, BankEntity>))]
[JsonSerializable(typeof(Dictionary<string, BoxEntity>))]
[JsonSerializable(typeof(Dictionary<string, PkmVariantEntity>))]
[JsonSerializable(typeof(Dictionary<string, DexFormEntity>))]
[JsonSerializable(typeof(Dictionary<string, string>))]
public partial class EntityJsonContext : JsonSerializerContext
{
}
