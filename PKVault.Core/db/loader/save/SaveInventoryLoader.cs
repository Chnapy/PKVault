using PKHeX.Core;

namespace PKVault.Core;

public interface ISaveInventoryLoader
{
    public bool HasWritten { get; set; }

    public Dictionary<string, InventoryItemDTO> GetAllDtos();
    // public void WriteDto(PouchDTO dto);
    // public PouchDTO? GetDto(InventoryType type);
}

public class SaveInventoryLoader(SaveWrapper save, ISettingsService settingsService) : ISaveInventoryLoader
{
    public bool HasWritten { get; set; } = false;

    private readonly HashSet<ushort> AllowedHeldItems = save.GetSave().HeldItems.ToArray().ToHashSet();

    public Dictionary<string, InventoryItemDTO> GetAllDtos()
    {
        var itemsStrings = GameInfo.GetStrings(settingsService.GetSettings().GetLanguageForPKHeX()).GetItemStrings(save.Context, save.Version);

        return save.GetSave().Inventory.Pouches.SelectMany(pouch =>
        {
            var currentSlot = -1;

            return pouch.Items
            .Where(item => item.Count > 0)
            .Select(item =>
            {
                currentSlot++;

                return new InventoryItemDTO(
                    Id: $"{save.Id}_{pouch.Type}_{item.Index}",
                    Item: item.Index,
                    Name: itemsStrings[item.Index],
                    Type: pouch.Type,
                    Version: save.Version,
                    Count: item.Count,
                    BoxId: SaveBoxLoader.GetInventoryBoxId(pouch.Type),
                    BoxSlot: currentSlot,
                    CanBeHeld: item.Index <= ushort.MaxValue && AllowedHeldItems.Contains((ushort)item.Index)
                );
            });
        }).ToDictionary(item => item.Id);
    }

    // public void WriteDto(PouchDTO dto)
    // {
    // }

    // public PouchDTO? GetDto(InventoryType type)
    // {
    // }
}
