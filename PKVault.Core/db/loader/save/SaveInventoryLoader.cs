using PKHeX.Core;
using Serilog;

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

    private PlayerBag Inventory = save.CreateInventory();

    public Dictionary<string, InventoryItemDTO> GetAllDtos()
    {
        var itemsStrings = GameInfo.GetStrings(settingsService.GetSettings().GetLanguageForPKHeX()).GetItemStrings(save.Context, save.Version);

        var allowedHeldItems = GetAllowedHeldItems();

        return Inventory.Pouches.SelectMany(pouch =>
        {
            var currentSlot = -1;

            List<InventoryItemDTO> items = [];
            for (var i = 0; i < pouch.Items.Length; i++)
            {
                var item = pouch.Items[i];
                if (item.Count == 0)
                    continue;

                currentSlot++;

                items.Add(new InventoryItemDTO(
                    Id: $"{save.Id}_{pouch.Type}_{item.Index}_{i}",
                    Item: (ushort)item.Index,
                    Name: itemsStrings[item.Index],
                    Type: pouch.Type,
                    Version: save.Version,
                    Count: item.Count,
                    BoxId: SaveBoxLoader.GetInventoryBoxId(pouch.Type),
                    BoxSlot: currentSlot,
                    InventorySlot: i,
                    CanBeHeld: allowedHeldItems.Contains((ushort)item.Index)
                ));
            }
            return items;
        }).ToDictionary(item => item.Id);
    }

    public InventoryItemDTO DecrementItemCount(string id)
    {
        var dto = GetDto(id);
        ArgumentNullException.ThrowIfNull(dto);

        WriteItem(dto.Type, dto.InventorySlot, count => count - 1);

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
        var targetPouch = Inventory.Pouches.FirstOrDefault(p => p.Type == type);
        var pouch = targetPouch;

        if (pouch == null || !pouch.GetAllItems().Contains(item))
            pouch = Inventory.Pouches.FirstOrDefault(p => p.GetAllItems().Contains(item));

        pouch ??= targetPouch ?? Inventory.Pouches[0];

        for (var i = 0; i < pouch.Items.Length; i++)
        {
            var found = pouch.Items[i];
            if (found.Index != item && found.Index != 0)
                continue;

            // force for fallback case
            found.Index = item;

            // all extra checks are done here
            WriteItem(pouch.Type, i, countFn);
            break;
        }
    }

    private void WriteItem(InventoryType type, int slot, Func<int, int> countFn)
    {
        // var items = GameInfo.Sources.GetItemDataSource(save.Version, save.Context, save.GetSave().HeldItems)
        //     .Select(e => e.Value)
        //     .Where(value => value <= save.MaxItemID)
        //     .ToHashSet();

        var allowedInventoryItems = GetAllowedInventoryItems();

        void SetItem(InventoryPouch pouch, ushort itemValue, InventoryItem item)
        {
            if (!allowedInventoryItems.Contains(itemValue))
                throw new ArgumentException($"Item manipulation not allowed, type={type} item={itemValue} version={save.Version}");

            if (!pouch.GetAllItems().Contains(itemValue))
                throw new ArgumentException($"Pouch {pouch.Type} cannot have item {itemValue}");

            item.Index = itemValue;

            var oldCount = item.Count;
            var count = countFn(oldCount);

            if (count < 0
                || count > pouch.MaxCount
                || !Inventory.IsQuantitySane(pouch.Type, item.Index, ref count, hasNew: true)
            )
                throw new Exception($"Count is invalid for item={pouch.Type}/{item.Index} count={count} oldCount={oldCount}");

            item.SetNewDetails(count);

            Inventory.CopyTo(save.GetSave());
            Inventory = save.CreateInventory();

            Log.Debug($"Write {save.GetSave().GetType().Name} item: pouch.type={pouch.Type} item={item.Index} count={item.Count}");

            if (item.Count == oldCount)
                throw new Exception($"Item count did not change: type={pouch.Type} item={item.Index} count={oldCount}");
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

            throw new ArgumentException($"No enough space in save inventory, type={type} slot={slot} items.count={pouch.Items.Length}");
        }
    }

    public InventoryItemDTO? GetDto(string id)
    {
        var dtos = GetAllDtos();
        return dtos.TryGetValue(id, out var dto) ? dto : null;
    }

    private HashSet<ushort> GetAllowedInventoryItems() => pkmConverterUtils.GetStaticVersionsSavesAllowedItems().SavesAllowedItems[(byte)save.Version].AllowedInventoryItems;
    private HashSet<ushort> GetAllowedHeldItems() => pkmConverterUtils.GetStaticVersionsSavesAllowedItems().SavesAllowedItems[(byte)save.Version].AllowedHeldItems;
}
