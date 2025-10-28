using System.Text.Json.Serialization;

[JsonSerializable(typeof(FileExploreRequest))]
[JsonSerializable(typeof(FileExploreResponse))]
public partial class FileExploreJsonContext : JsonSerializerContext
{
}
