using PKHeX.Core;

namespace PKVault.Core;

public interface ISaveInventoryLoader
{
    public bool HasWritten { get; set; }

    public Dictionary<string, InventoryItemDTO> GetAllDtos();
    public InventoryItemDTO DecrementItemCount(string id);
    public InventoryItemDTO IncrementItemCount(int srcItem, GameVersion srcVersion);
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

    public InventoryItemDTO DecrementItemCount(string id)
    {
        GetAllDtos().TryGetValue(id, out var dto);
        ArgumentNullException.ThrowIfNull(dto);

        WriteItem(dto.Item, count => count - 1);

        GetAllDtos().TryGetValue(id, out var dto2);

        return dto2 ?? dto;
    }

    public InventoryItemDTO IncrementItemCount(int srcItem, GameVersion srcVersion)
    {
        var convertedItem = PKMConverterUtils.ConvertHeldItem(srcItem, srcVersion, save.Version);
        ArgumentNullException.ThrowIfNull(convertedItem);

        WriteItem((int)convertedItem, count => count + 1);

        var dto = GetAllDtos().Values.First(dto => dto.Item == convertedItem);
        return dto;
    }

    // private void WriteDto(InventoryItemDTO dto)
    // {
    //     WriteItem(dto.Item, (count) => dto.Count);
    // }

    private void WriteItem(int item, Func<int, int> countFn)
    {
        (InventoryType Type, InventoryItem Item) foundItem = default;
        foreach (var pouch in save.GetSave().Inventory.Pouches)
        {
            var found = pouch.Items.FirstOrDefault(i => i.Index == item);
            if (found != default)
            {
                foundItem = (pouch.Type, found);
                break;
            }
        }
        ArgumentNullException.ThrowIfNull(foundItem.Item);

        var count = countFn(foundItem.Item.Count);

        if (!save.GetSave().Inventory.IsQuantitySane(foundItem.Type, foundItem.Item.Index, ref count, hasNew: true))
            throw new Exception($"Count is invalid for item={foundItem.Type}/{foundItem.Item.Index} count={count}");

        foundItem.Item.SetNewDetails(count);
    }

    // public PouchDTO? GetDto(InventoryType type)
    // {
    // }
}
