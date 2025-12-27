using System.Text.Json.Serialization;

[JsonSerializable(typeof(DesktopRequestMessage))]
[JsonSerializable(typeof(FileExploreRequestMessage))]
[JsonSerializable(typeof(FileExploreResponseMessage))]
[JsonSerializable(typeof(OpenFolderRequestMessage))]
[JsonSerializable(typeof(OpenFolderResponseMessage))]
public partial class DesktopMessageJsonContext : JsonSerializerContext
{
}
