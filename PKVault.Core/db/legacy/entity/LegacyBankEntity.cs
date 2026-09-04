using System.Text.Json.Serialization;

namespace PKVault.Core;

public record LegacyBankEntity(
    string Id,
    string Name,
    bool IsDefault,
    int Order,
    LegacyBankEntity.LegacyBankView View,
    int SchemaVersion = 0
) : ILegacyEntity(SchemaVersion, Id)
{
    public record LegacyBankView(int[] MainBoxIds, LegacyBankViewSave[] Saves);

    public record LegacyBankViewSave(uint SaveId, int[] SaveBoxIds, int Order);

    [JsonIgnore()]
    public int IdInt => int.Parse(Id);
}
