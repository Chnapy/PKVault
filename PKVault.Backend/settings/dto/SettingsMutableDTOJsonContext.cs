
using System.Text.Json;
using System.Text.Json.Serialization;

[JsonSerializable(typeof(SettingsMutableDTO))]
[JsonSourceGenerationOptions(
    WriteIndented = true
)]
public partial class SettingsMutableDTOJsonContext : JsonSerializerContext
{
}
