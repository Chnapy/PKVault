using System.Text.Json.Serialization;

[JsonSerializable(typeof(DesktopRequestMessage))]
[JsonSerializable(typeof(FileExploreRequestMessage))]
[JsonSerializable(typeof(FileExploreResponseMessage))]
[JsonSerializable(typeof(OpenFolderRequestMessage))]
[JsonSerializable(typeof(StartFinishRequestMessage))]
public partial class DesktopMessageJsonContext : JsonSerializerContext
{
}
