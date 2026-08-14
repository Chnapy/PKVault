using System.Text.Json.Serialization;

[JsonSerializable(typeof(DesktopRequestMessage))]
[JsonSerializable(typeof(FileExploreRequestMessage))]
[JsonSerializable(typeof(FileExploreResponseMessage))]
[JsonSerializable(typeof(OpenFolderRequestMessage))]
[JsonSerializable(typeof(StartFinishRequestMessage))]
[JsonSerializable(typeof(ToggleFullscreenRequestMessage))]
[JsonSerializable(typeof(ToggleFullscreenResponseMessage))]
public partial class DesktopMessageJsonContext : JsonSerializerContext
{
}
