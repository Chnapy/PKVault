using PKHeX.Core;

namespace PKVault.Core;

public interface ISaveInventoryLoader
{
    public bool HasWritten { get; set; }

    public Dictionary<string, InventoryItemDTO> GetAllDtos();
    public InventoryItemDTO? GetDto(string id);
    public InventoryItemDTO DecrementItemCount(string id);
    public InventoryItemDTO IncrementItemCount(InventoryType type, int srcItem, EntityContext srcContext);
}

public class SaveInventoryLoader(SaveWrapper save, ISettingsService settingsService, PKMConverterUtils pkmConverterUtils) : ISaveInventoryLoader
{
    public bool HasWritten { get; set; } = false;

    private readonly HashSet<ushort> AllowedItems = pkmConverterUtils.allSavesAllowedItems[(byte)save.Version].AllowedInventoryItems;
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
                        Id: $"{save.Id}_{pouch.Type}_{item.Index}_{currentSlot}",
                        Item: (ushort)item.Index,
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

        WriteItem(dto.Type, dto.BoxSlot, count => count - 1);

        var dto2 = GetDto(id);

        return dto2 ?? dto;
    }

    public InventoryItemDTO IncrementItemCount(InventoryType type, int srcItem, EntityContext srcContext)
    {
        var convertedItem = pkmConverterUtils.ConvertHeldItemRequired(srcItem, srcContext, [save.Version], held: false);

        WriteItem(type, convertedItem.Item, count => count + 1);

        var dto = GetAllDtos().Values.First(dto => dto.Item == convertedItem.Item);
        return dto;
    }

    private void WriteItem(InventoryType type, ushort item, Func<int, int> countFn)
    {
        foreach (var pouch in Inventory.Pouches)
        {
            if (pouch.Type != type)
                continue;

            for (var i = 0; i < pouch.Items.Length; i++)
            {
                var found = pouch.Items[i];
                if (found.Index != item && found.Index != 0)
                    continue;

                // force for fallback case
                found.Index = item;

                // all extra checks are done here
                WriteItem(pouch.Type, i, countFn);
                return;
            }

            throw new ArgumentException($"Item not found in save inventory, item={item}");
        }
    }

    private void WriteItem(InventoryType type, int slot, Func<int, int> countFn)
    {
        // var items = GameInfo.Sources.GetItemDataSource(save.Version, save.Context, save.GetSave().HeldItems)
        //     .Select(e => e.Value)
        //     .Where(value => value <= save.MaxItemID)
        //     .ToHashSet();

        void SetItem(InventoryPouch pouch, ushort itemValue, InventoryItem item)
        {
            if (!AllowedItems.Contains(itemValue))
                throw new ArgumentException($"Item manipulation not allowed, type={type} item={itemValue} version={save.Version}");

            item.Index = itemValue;

            var count = countFn(item.Count);

            if (count < 0
                || count > pouch.MaxCount
                || !Inventory.IsQuantitySane(pouch.Type, item.Index, ref count, hasNew: true)
                || !Inventory.IsLegal(pouch.Type, item.Index, count)
            )
                throw new Exception($"Count is invalid for item={pouch.Type}/{item.Index} count={count}");

            item.SetNewDetails(count);

            Inventory.CopyTo(save.GetSave());
            Inventory = save.CreateInventory();
        }

        foreach (var pouch in Inventory.Pouches)
        {
            if (pouch.Type != type)
                continue;

            ushort itemValue = 0;

            for (var i = 0; i < pouch.Items.Length; i++)
            {
                var item = pouch.Items[i];

                if (itemValue == 0)
                {
                    if (i != slot)
                        continue;

                    itemValue = (ushort)item.Index;
                }

                if (item.Index == itemValue)
                {
                    if (countFn(item.Count) > pouch.MaxCount
                        || countFn(item.Count) < 0
                    )
                        continue;

                    SetItem(pouch, itemValue, item);
                    return;
                }
                else if (item.Index == 0)
                {
                    SetItem(pouch, itemValue, item);
                    return;
                }
            }

            throw new ArgumentException($"Item not found in save inventory, type={type} slot={slot}");
        }
    }

    public InventoryItemDTO? GetDto(string id)
    {
        var dtos = GetAllDtos();
        return dtos.TryGetValue(id, out var dto) ? dto : null;
    }
}
