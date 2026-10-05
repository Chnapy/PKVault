using PKHeX.Core;

namespace PKVault.Core;

public record MoveItemActionInput(
    uint? sourceSaveId, string sourceBoxId,
    string[] sourcePkmIds, string[] sourceItemIds,

    uint? targetSaveId, string targetBoxId,
    string? targetPkmId);

public class MoveItemAction(
    IPkmVariantLoader pkmVariantLoader, ISavesLoadersService savesLoadersService,
    EditPkmVariantAction editPkmVariantAction, EditPkmSaveAction editPkmSaveAction,
    PKMConverterUtils pkmConverterUtils, IInventoryLoader inventoryLoader, IBoxLoader boxLoader
) : DataAction<MoveItemActionInput>
{
    protected override async Task<DataActionPayload> Execute(MoveItemActionInput input, DataUpdateFlags flags)
    {
        if (input.sourcePkmIds.Length == 0 && input.sourceItemIds.Length == 0)
            throw new ArgumentException($"Pkm ids + item ids cannot be empty");

        if (input.sourcePkmIds.Length > 0 && input.sourceItemIds.Length > 0)
            throw new ArgumentException($"Pkm ids + item ids cannot be filled");

        if (input.targetPkmId != null && (input.sourcePkmIds.Length > 1 || input.sourceItemIds.Length > 1))
            throw new ArgumentException($"Multiple items cannot be given to a pkm");

        if (input.targetPkmId == null && input.targetSaveId == null && input.targetBoxId == null)
            throw new ArgumentException($"Cannot move items with no targets");

        var targetBoxId = int.Parse(input.targetBoxId);
        var sourceBoxId = int.Parse(input.sourceBoxId);

        if (input.sourceItemIds.Length > 0 && input.targetPkmId != null)
            return await InventoryToPkm(input.sourceSaveId, sourceBoxId, input.sourceItemIds.First(), input.targetSaveId, input.targetPkmId, flags);

        if (input.sourcePkmIds.Length > 0 && input.targetPkmId != null)
            return await PkmToPkm(input.sourceSaveId, input.sourcePkmIds.First(), input.targetSaveId, input.targetPkmId, flags);

        if (input.sourceItemIds.Length > 0 && input.targetPkmId == null)
            return await InventoryToInventory(input.sourceSaveId, input.sourceItemIds, input.targetSaveId, targetBoxId, flags);

        if (input.sourcePkmIds.Length > 0 && input.targetPkmId == null)
            return await PkmToInventory(input.sourceSaveId, input.sourcePkmIds, input.targetSaveId, targetBoxId, flags);

        throw new ArgumentException($"Wrong arguments");
    }

    private async Task<DataActionPayload> InventoryToPkm(
        uint? sourceSaveId, int sourceBoxId, string sourceItemId,
        uint? targetSaveId, string targetPkmId,
        DataUpdateFlags flags
    )
    {
        var item = await DecrementInventoryItemCount(sourceSaveId, sourceItemId, flags);

        if (targetSaveId != null)
        {
            var targetSaveLoader = savesLoadersService.GetLoadersRequired((uint)targetSaveId);

            var targetPkmDto = targetSaveLoader.Pkms.GetDto(targetPkmId);
            ArgumentNullException.ThrowIfNull(targetPkmDto);

            if (!targetPkmDto.CanHeldItem || !targetPkmDto.CanEdit)
                throw new ArgumentException($"Pkm cannot held item, id={targetPkmDto.Id}");

            var saveConvertedHeldItem = pkmConverterUtils.ConvertHeldItemRequired(item.Item, item.Version, [targetSaveLoader.Save.Version]);

            var saveTargetPkmPreviousItem = targetPkmDto.HeldItem;

            targetPkmDto = targetPkmDto with
            {
                Pkm = targetPkmDto.Pkm.Update(pkm =>
                {
                    pkm.HeldItem = saveConvertedHeldItem.Item;
                })
            };

            targetSaveLoader.Pkms.WriteDto(targetPkmDto);
            flags.Saves.UseSave((uint)targetSaveId).SavePkms.Ids.Add(targetPkmDto.Id);

            if (saveTargetPkmPreviousItem > 0)
            {
                await IncrementInventoryItemCount(sourceSaveId, sourceBoxId, saveTargetPkmPreviousItem, targetSaveLoader.Save.Version, flags);
            }

            return new(
                type: DataActionType.MOVE_ITEM,
                parameters: [
                    item.Item, item.Version,
                    sourceSaveId == null ? null : item.Version, null,
                    targetSaveLoader.Save.Version, targetPkmDto.Nickname
                ]
            );
        }

        var variant = await pkmVariantLoader.GetEntityRequired(targetPkmId);
        var variantDto = await pkmVariantLoader.CreateDTO(variant);
        var pkm = variantDto.Pkm;

        if (!variantDto.CanHeldItem || !variantDto.CanEdit)
            throw new ArgumentException($"Pkm cannot held item, id={variant.Id}");

        var variantConvertedHeldItem = pkmConverterUtils.ConvertHeldItemRequired(item.Item, item.Version, GetVariantGameVersions(variant));

        var variantTargetPkmPreviousItem = pkm.HeldItem;

        pkm = pkm.Update(pkm =>
        {
            pkm.HeldItem = variantConvertedHeldItem.Item;
        });

        await pkmVariantLoader.UpdateEntity(variant, pkm);

        if (variantTargetPkmPreviousItem > 0)
        {
            var box = await boxLoader.GetEntityRequired(variant.BoxId);
            await IncrementInventoryItemCount(sourceSaveId, box.IdInt, variantTargetPkmPreviousItem, variantConvertedHeldItem.Version, flags);
        }

        return new(
            type: DataActionType.MOVE_ITEM,
            parameters: [
                item.Item, item.Version,
                sourceSaveId == null ? null : item.Version, null,
                null, pkm.Nickname
            ]
        );
    }

    private async Task<DataActionPayload> PkmToPkm(
        uint? sourceSaveId, string sourcePkmId,
        uint? targetSaveId, string targetPkmId,
        DataUpdateFlags flags
    )
    {
        var item = await PickPkmItem(sourceSaveId, sourcePkmId, flags);

        if (targetSaveId != null)
        {
            var targetSaveLoader = savesLoadersService.GetLoadersRequired((uint)targetSaveId);

            var convertedHeldItem = pkmConverterUtils.ConvertHeldItemRequired(item.Item, item.Version, [targetSaveLoader.Save.Version]);

            var targetPkmDto = targetSaveLoader.Pkms.GetDto(targetPkmId);
            ArgumentNullException.ThrowIfNull(targetPkmDto);

            if (!targetPkmDto.CanHeldItem || !targetPkmDto.CanEdit)
                throw new ArgumentException($"Pkm cannot held item, id={targetPkmDto.Id}");

            var targetPkmPreviousItem = targetPkmDto.HeldItem;

            targetPkmDto = targetPkmDto with
            {
                Pkm = targetPkmDto.Pkm.Update(pkm =>
                {
                    pkm.HeldItem = convertedHeldItem.Item;
                })
            };

            targetSaveLoader.Pkms.WriteDto(targetPkmDto);
            flags.Saves.UseSave((uint)targetSaveId).SavePkms.Ids.Add(targetPkmDto.Id);

            if (targetPkmPreviousItem > 0)
            {
                await GivePkmItem(sourceSaveId, sourcePkmId, targetPkmPreviousItem, targetSaveLoader.Save.Version, flags);
            }

            return new(
                type: DataActionType.MOVE_ITEM,
                parameters: [
                    item.Item, item.Version,
                    sourceSaveId == null ? null : item.Version, item.PkmName,
                    targetSaveLoader.Save.Version, targetPkmDto.Nickname
                ]
            );
        }

        var variant = await pkmVariantLoader.GetEntityRequired(targetPkmId);
        var variantDto = await pkmVariantLoader.CreateDTO(variant);
        var pkm = variantDto.Pkm;

        if (!variantDto.CanHeldItem || !variantDto.CanEdit)
            throw new ArgumentException($"Pkm cannot held item, id={variant.Id}");

        var variantConvertedHeldItem = pkmConverterUtils.ConvertHeldItemRequired(item.Item, item.Version, GetVariantGameVersions(variant));

        var variantTargetPkmPreviousItem = pkm.HeldItem;

        pkm = pkm.Update(pkm =>
        {
            pkm.HeldItem = variantConvertedHeldItem.Item;
        });

        await pkmVariantLoader.UpdateEntity(variant, pkm);

        if (variantTargetPkmPreviousItem > 0)
        {
            await GivePkmItem(sourceSaveId, sourcePkmId, variantTargetPkmPreviousItem, variantConvertedHeldItem.Version, flags);
        }

        return new(
            type: DataActionType.MOVE_ITEM,
            parameters: [
                item.Item, item.Version,
                sourceSaveId == null ? null : item.Version, item.PkmName,
                null, pkm.Nickname
            ]
        );
    }

    public async Task<DataActionPayload> InventoryToInventory(
        uint? sourceSaveId, string[] sourceItemIds,
        uint? targetSaveId, int targetBoxId,
        DataUpdateFlags flags
    )
    {
        var items = await DecrementInventoryItemCount(sourceSaveId, sourceItemIds, flags);
        var firstItem = items.First();

        var targetItems = await IncrementInventoryItemCount(targetSaveId, targetBoxId, items.Select(i => (i.Item, i.Version)).ToArray(), flags);

        return new(
            type: DataActionType.MOVE_ITEM,
            parameters: [
                firstItem.Item, firstItem.Version,
                sourceSaveId == null ? null : firstItem.Version, null,
                targetSaveId == null ? null : targetItems.First().Version, null,
            ]
        );
    }

    public async Task<DataActionPayload> PkmToInventory(
        uint? sourceSaveId, string[] sourcePkmIds,
        uint? targetSaveId, int targetBoxId,
        DataUpdateFlags flags
    )
    {
        var items = await PickPkmItem(sourceSaveId, sourcePkmIds, flags);
        var firstItem = items.First();

        var targetItems = await IncrementInventoryItemCount(targetSaveId, targetBoxId, items.Select(i => (i.Item, i.Version)).ToArray(), flags);

        return new(
            type: DataActionType.MOVE_ITEM,
            parameters: [
                firstItem.Item, firstItem.Version,
                sourceSaveId == null ? null : firstItem.Version, firstItem.PkmName,
                targetSaveId == null ? null : targetItems.First().Version, null,
            ]
        );
    }

    private async Task<InventoryItemDTO> IncrementInventoryItemCount(uint? saveId, int boxId, ushort srcItem, GameVersion srcVersion, DataUpdateFlags flags)
    {
        return (await IncrementInventoryItemCount(saveId, boxId, [(srcItem, srcVersion)], flags)).First();
    }

    private async Task<InventoryItemDTO[]> IncrementInventoryItemCount(uint? saveId, int boxId, (ushort Item, GameVersion Version)[] srcItems, DataUpdateFlags flags)
    {
        if (saveId == null)
        {
            List<InventoryItemDTO> items = [];
            foreach (var (item, version) in srcItems)
                items.Add(await inventoryLoader.IncrementItemCount(item, version, boxId));
            return items.ToArray();
        }

        var saveLoader = savesLoadersService.GetLoadersRequired((uint)saveId);
        var box = saveLoader.Boxes.GetDto(boxId.ToString()!);
        ArgumentNullException.ThrowIfNull(box?.InventoryType);

        flags.Saves.UseSave((uint)saveId).SaveInventoryItems = true;

        return srcItems.Select(item => saveLoader.Inventory.IncrementItemCount((InventoryType)box.InventoryType, item.Item, item.Version)).ToArray();
    }

    private async Task<InventoryItemDTO> DecrementInventoryItemCount(uint? saveId, string itemId, DataUpdateFlags flags)
    {
        return (await DecrementInventoryItemCount(saveId, [itemId], flags)).First();
    }

    private async Task<InventoryItemDTO[]> DecrementInventoryItemCount(uint? saveId, string[] itemIds, DataUpdateFlags flags)
    {
        if (saveId == null)
        {
            List<InventoryItemDTO> items = [];
            foreach (var itemId in itemIds)
                items.Add(await inventoryLoader.DecrementItemCount(itemId));
            return items.ToArray();
        }

        var saveLoader = savesLoadersService.GetLoadersRequired((uint)saveId);

        flags.Saves.UseSave((uint)saveId).SaveInventoryItems = true;

        return itemIds.Select(saveLoader.Inventory.DecrementItemCount).ToArray();
    }

    private async Task GivePkmItem(uint? saveId, string pkmId, int srcItem, GameVersion srcVersion, DataUpdateFlags flags)
    {
        if (saveId == null)
        {
            var variant = await pkmVariantLoader.GetEntityRequired(pkmId);
            var variantDto = await pkmVariantLoader.CreateDTO(variant);
            var pkm = variantDto.Pkm;

            if (!variantDto.CanHeldItem || !variantDto.CanEdit)
                throw new ArgumentException($"Pkm cannot held item, id={variant.Id}");

            var variantItem = pkmConverterUtils.ConvertHeldItemRequired(srcItem, srcVersion, GetVariantGameVersions(variant), held: false);

            pkm = pkm.Update(pkm =>
            {
                pkm.HeldItem = variantItem.Item;
            });
            await pkmVariantLoader.UpdateEntity(variant, pkm);
            await editPkmVariantAction.ShareChangesToVariantsAndAttached(variant, pkm, flags);

            return;
        }

        var saveLoader = savesLoadersService.GetLoadersRequired((uint)saveId);
        var dto = saveLoader.Pkms.GetDto(pkmId);
        ArgumentNullException.ThrowIfNull(dto);

        if (!dto.CanHeldItem || !dto.CanEdit)
            throw new ArgumentException($"Pkm cannot held item, id={dto.Id}");

        var saveItem = pkmConverterUtils.ConvertHeldItemRequired(srcItem, srcVersion, [saveLoader.Save.Version]);

        dto = dto with
        {
            Pkm = dto.Pkm.Update(pkm =>
            {
                pkm.HeldItem = saveItem.Item;
            })
        };
        saveLoader.Pkms.WriteDto(dto);
        flags.Saves.UseSave((uint)saveId).SavePkms.Ids.Add(dto.Id);
        await editPkmSaveAction.ShareChangesToAttached(dto);
    }

    private async Task<(ushort Item, GameVersion Version, string PkmName)> PickPkmItem(uint? saveId, string pkmId, DataUpdateFlags flags)
    {
        return (await PickPkmItem(saveId, [pkmId], flags)).First();
    }

    private async Task<(ushort Item, GameVersion Version, string PkmName)[]> PickPkmItem(uint? saveId, string[] pkmIds, DataUpdateFlags flags)
    {
        if (saveId == null)
        {
            var variants = await pkmVariantLoader.GetEntitiesByIds(pkmIds);

            var savesAllowedItems = pkmConverterUtils.GetStaticVersionsSavesAllowedItems().SavesAllowedItems;

            List<(ushort Item, GameVersion Version, string PkmName)> variantResults = [];
            foreach (var variant in variants.Values)
            {
                ArgumentNullException.ThrowIfNull(variant);
                var pkm = await pkmVariantLoader.GetPKM(variant);

                var variantItem = pkm.HeldItem;
                if (variantItem == 0)
                    throw new ArgumentException($"Target Pkm does not have any held-item, variant.id={variant.Id}");

                pkm = pkm.Update(pkm =>
                {
                    pkm.HeldItem = 0;
                });
                await pkmVariantLoader.UpdateEntity(variant, pkm);
                await editPkmVariantAction.ShareChangesToVariantsAndAttached(variant, pkm, flags);

                var version = GetVariantGameVersions(variant).First(version =>
                    savesAllowedItems[(byte)version].AllowedInventoryItems.Contains(variantItem)
                );

                variantResults.Add((variantItem, version, pkm.Nickname));
            }
            return variantResults.ToArray();
        }

        var saveLoader = savesLoadersService.GetLoadersRequired((uint)saveId);

        List<(ushort Item, GameVersion Version, string PkmName)> saveResults = [];
        foreach (var pkmId in pkmIds)
        {
            var dto = saveLoader.Pkms.GetDto(pkmId);
            ArgumentNullException.ThrowIfNull(dto);

            var saveItem = dto.Pkm.HeldItem;
            if (saveItem == 0)
                throw new ArgumentException($"Target Pkm does not have any held-item, id={pkmId} saveId={saveId}");

            dto = dto with
            {
                Pkm = dto.Pkm.Update(pkm =>
                {
                    pkm.HeldItem = 0;
                })
            };
            saveLoader.Pkms.WriteDto(dto);
            flags.Saves.UseSave((uint)saveId).SavePkms.Ids.Add(dto.Id);
            await editPkmSaveAction.ShareChangesToAttached(dto);

            saveResults.Add((saveItem, saveLoader.Save.Version, dto.Nickname));
        }

        return saveResults.ToArray();
    }

    private GameVersion[] GetVariantGameVersions(PkmVariantEntity variant)
    {
        if (variant.AttachedSaveId != null)
        {
            var saveLoaders = savesLoadersService.GetLoadersRequired((uint)variant.AttachedSaveId);
            return [saveLoaders.Save.Version];
        }

        return GameUtil.GameVersions.Where(v => v.Context == variant.Context).ToArray();
    }
}
