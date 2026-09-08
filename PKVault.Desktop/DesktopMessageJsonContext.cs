using System.Text.Json.Serialization;

[JsonSerializable(typeof(DesktopRequestMessage))]
[JsonSerializable(typeof(DesktopResponseMessage))]
public partial class DesktopMessageJsonContext : JsonSerializerContext
{
}
