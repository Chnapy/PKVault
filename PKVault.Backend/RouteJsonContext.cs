
using System.Text.Json.Serialization;

[JsonSerializable(typeof(SettingsDTO))]
[JsonSerializable(typeof(WarningsDTO))]
[JsonSerializable(typeof(List<BoxDTO>))]
[JsonSerializable(typeof(List<PkmDTO>))]
[JsonSerializable(typeof(List<PkmVersionDTO>))]
[JsonSerializable(typeof(List<PkmSaveDTO>))]
[JsonSerializable(typeof(List<MoveItem>))]
[JsonSerializable(typeof(List<BackupDTO>))]
[JsonSerializable(typeof(DataDTO))]
[JsonSerializable(typeof(SettingsDTO))]
[JsonSerializable(typeof(StaticDataDTO))]
[JsonSerializable(typeof(Dictionary<uint, SaveInfosDTO>))]
[JsonSerializable(typeof(List<string>))]
[JsonSerializable(typeof(EditPkmVersionPayload))]
public partial class RouteJsonContext : JsonSerializerContext
{
}
