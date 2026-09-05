
using System.Text.Json;
using System.Text.Json.Serialization;

namespace PKVault.Core;

[JsonSerializable(typeof(SettingsMutableDTO))]
[JsonSourceGenerationOptions(
    WriteIndented = true
)]
public partial class SettingsMutableDTOJsonContext : JsonSerializerContext
{
}
