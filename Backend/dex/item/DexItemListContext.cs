using System.Text.Json.Serialization;

[JsonSourceGenerationOptions(WriteIndented = true)]
[JsonSerializable(typeof(List<DexItem>))]
internal partial class DexItemContext : JsonSerializerContext
{
}