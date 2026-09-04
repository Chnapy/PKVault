
using System.Text.Json.Serialization;

namespace PKVault.Core;

[JsonSerializable(typeof(SettingsDTO))]
[JsonSerializable(typeof(DirectoryContent))]
[JsonSerializable(typeof(WarningsDTO))]
[JsonSerializable(typeof(List<BankDTO>))]
[JsonSerializable(typeof(List<BoxDTO>))]
[JsonSerializable(typeof(List<PkmVariantDTO>))]
[JsonSerializable(typeof(List<PkmSaveDTO>))]
[JsonSerializable(typeof(List<MoveItem>))]
[JsonSerializable(typeof(List<BackupDTO>))]
[JsonSerializable(typeof(DexMoveDTO))]
[JsonSerializable(typeof(DexLocationDTO))]
[JsonSerializable(typeof(StaticEvolvesRichData))]
[JsonSerializable(typeof(DataDTO))]
[JsonSerializable(typeof(SettingsDTO))]
[JsonSerializable(typeof(StaticDataDTO))]
[JsonSerializable(typeof(Dictionary<uint, SaveInfosDTO>))]
[JsonSerializable(typeof(Dictionary<string, PkmLegalityDTO>))]
[JsonSerializable(typeof(List<string>))]
[JsonSerializable(typeof(EditPkmVariantPayload))]
[JsonSerializable(typeof(BankEntity.BankView))]
[JsonSerializable(typeof(BankEntity.BankViewSave))]
[JsonSerializable(typeof(Guid?))]
[JsonSerializable(typeof(string))]

[JsonSerializable(typeof(Dictionary<string, object?>))]
public partial class RouteJsonContext : JsonSerializerContext
{
}
