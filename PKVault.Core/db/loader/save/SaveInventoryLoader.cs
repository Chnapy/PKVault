using PKHeX.Core;

namespace PKVault.Core;

public interface ISaveInventoryLoader
{
    public bool HasWritten { get; set; }

    public Dictionary<string, InventoryItemDTO> GetAllDtos();
    public InventoryItemDTO? GetDto(string id);
    public InventoryItemDTO DecrementItemCount(string id);
    public InventoryItemDTO IncrementItemCount(int srcItem, GameVersion srcVersion);
}

public class SaveInventoryLoader(SaveWrapper save, ISettingsService settingsService, PKMConverterUtils pkmConverterUtils) : ISaveInventoryLoader
{
    public bool HasWritten { get; set; } = false;

    private readonly HashSet<ushort> AllowedItems = pkmConverterUtils.allSavesAllowedItems[(byte)save.Version].AllowedItems;
    private PlayerBag Inventory = save.CreateInventory();

    public Dictionary<string, InventoryItemDTO> GetAllDtos()
    {
        var itemsStrings = GameInfo.GetStrings(settingsService.GetSettings().GetLanguageForPKHeX()).GetItemStrings(save.Context, save.Version);

        return Inventory.Pouches.SelectMany(pouch =>
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
                        CanBeHeld: AllowedItems.Contains((ushort)item.Index)
                    );
                });
        }).ToDictionary(item => item.Id);
    }

    public InventoryItemDTO DecrementItemCount(string id)
    {
        var dto = GetDto(id);
        ArgumentNullException.ThrowIfNull(dto);

        WriteItem(dto.Item, count => count - 1);

        var dto2 = GetDto(id);

        return dto2 ?? dto;
    }

    public InventoryItemDTO IncrementItemCount(int srcItem, GameVersion srcVersion)
    {
        var convertedItem = pkmConverterUtils.ConvertHeldItemRequired(srcItem, srcVersion, save.Version);

        WriteItem((int)convertedItem, count => count + 1);

        var dto = GetAllDtos().Values.First(dto => dto.Item == convertedItem);
        return dto;
    }

    private void WriteItem(int item, Func<int, int> countFn)
    {
        // var items = GameInfo.Sources.GetItemDataSource(save.Version, save.Context, save.GetSave().HeldItems)
        //     .Select(e => e.Value)
        //     .Where(value => value <= save.MaxItemID)
        //     .ToHashSet();

        if (!AllowedItems.Contains((ushort)item))
            throw new ArgumentException($"Item manipulation not allowed, item={item} version={save.Version}");

        foreach (var pouch in Inventory.Pouches)
        {
            InventoryItem found;
            for (var i = 0; i < pouch.Items.Length; i++)
            {
                found = pouch.Items[i];
                if (found.Index == item)
                {
                    var count = countFn(found.Count);

                    if (!Inventory.IsQuantitySane(pouch.Type, found.Index, ref count, hasNew: true)
                        || !Inventory.IsLegal(pouch.Type, item, count)
                    )
                        throw new Exception($"Count is invalid for item={pouch.Type}/{found.Index} count={count}");

                    found.SetNewDetails(count);

                    Inventory.CopyTo(save.GetSave());
                    Inventory = save.CreateInventory();

                    return;
                }
            }
        }
        throw new ArgumentException();
    }

    public InventoryItemDTO? GetDto(string id)
    {
        var dtos = GetAllDtos();
        return dtos.TryGetValue(id, out var dto) ? dto : null;
    }
}
