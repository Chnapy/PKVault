using PKHeX.Core;

namespace PKVault.Core;

public record MoveItemActionInput(
    uint? sourceSaveId,
    string[] sourcePkmIds, string[] sourceItemIds,

    uint? targetSaveId, string? targetPkmId);

public class MoveItemAction(
    IPkmVariantLoader pkmVariantLoader, ISavesLoadersService savesLoadersService,
    EditPkmVariantAction editPkmVariantAction, EditPkmSaveAction editPkmSaveAction
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

        if (input.sourceItemIds.Length > 0 && input.targetPkmId != null)
            return await InventoryToPkm(input.sourceSaveId, input.sourceItemIds.First(), input.targetSaveId, input.targetPkmId, flags);

        if (input.sourcePkmIds.Length > 0 && input.targetPkmId != null)
            return await PkmToPkm(input.sourceSaveId, input.sourcePkmIds.First(), input.targetSaveId, input.targetPkmId, flags);

        if (input.sourceItemIds.Length > 0 && input.targetPkmId == null)
            return await InventoryToInventory(input.sourceSaveId, input.sourceItemIds, input.targetSaveId, flags);

        if (input.sourcePkmIds.Length > 0 && input.targetPkmId == null)
            return await PkmToInventory(input.sourceSaveId, input.sourcePkmIds, input.targetSaveId, flags);

        throw new ArgumentException($"Wrong arguments");
    }

    private async Task<DataActionPayload> InventoryToPkm(
        uint? sourceSaveId, string sourceItemId,
        uint? targetSaveId, string targetPkmId,
        DataUpdateFlags flags
    )
    {
        var item = DecrementInventoryItemCount(sourceSaveId, sourceItemId, flags);

        if (targetSaveId != null)
        {
            var targetSaveLoader = savesLoadersService.GetLoadersRequired((uint)targetSaveId);

            var targetPkmDto = targetSaveLoader.Pkms.GetDto(targetPkmId);
            ArgumentNullException.ThrowIfNull(targetPkmDto);

            if (!targetPkmDto.CanHeldItem)
                throw new ArgumentException();

            var saveConvertedHeldItem = PKMConverterUtils.ConvertHeldItem(item.Item, item.Version, targetSaveLoader.Save.Version);
            ArgumentNullException.ThrowIfNull(saveConvertedHeldItem);

            var saveTargetPkmPreviousItem = targetPkmDto.HeldItem;

            targetPkmDto = targetPkmDto with
            {
                Pkm = targetPkmDto.Pkm.Update(pkm =>
                {
                    pkm.HeldItem = (int)saveConvertedHeldItem;
                })
            };

            targetSaveLoader.Pkms.WriteDto(targetPkmDto);
            flags.Saves.UseSave((uint)targetSaveId).SavePkms.Ids.Add(targetPkmDto.Id);

            if (saveTargetPkmPreviousItem > 0)
            {
                IncrementInventoryItemCount(sourceSaveId, saveTargetPkmPreviousItem, targetSaveLoader.Save.Version, flags);
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
        var pkm = await pkmVariantLoader.GetPKM(variant);
        var pkmVersion = pkm.Context.GetSingleGameVersion();

        if (!pkm.CanHeldItem)
            throw new ArgumentException();

        var variantConvertedHeldItem = PKMConverterUtils.ConvertHeldItem(item.Item, item.Version, pkmVersion);
        ArgumentNullException.ThrowIfNull(variantConvertedHeldItem);

        var variantTargetPkmPreviousItem = pkm.HeldItem;

        pkm = pkm.Update(pkm =>
        {
            pkm.HeldItem = (int)variantConvertedHeldItem;
        });

        await pkmVariantLoader.UpdateEntity(variant, pkm);

        if (variantTargetPkmPreviousItem > 0)
        {
            IncrementInventoryItemCount(sourceSaveId, variantTargetPkmPreviousItem, pkmVersion, flags);
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

            var convertedHeldItem = PKMConverterUtils.ConvertHeldItem(item.Item, item.Version, targetSaveLoader.Save.Version);
            ArgumentNullException.ThrowIfNull(convertedHeldItem);

            var targetPkmDto = targetSaveLoader.Pkms.GetDto(targetPkmId);
            ArgumentNullException.ThrowIfNull(targetPkmDto);

            if (!targetPkmDto.CanHeldItem)
                throw new ArgumentException();

            var targetPkmPreviousItem = targetPkmDto.HeldItem;

            targetPkmDto = targetPkmDto with
            {
                Pkm = targetPkmDto.Pkm.Update(pkm =>
                {
                    pkm.HeldItem = (int)convertedHeldItem;
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

        throw new NotImplementedException();
    }

    private async Task<DataActionPayload> InventoryToInventory(
        uint? sourceSaveId, string[] sourceItemIds,
        uint? targetSaveId,
        DataUpdateFlags flags
    )
    {
        var items = DecrementInventoryItemCount(sourceSaveId, sourceItemIds, flags);
        var firstItem = items.First();

        var targetItems = IncrementInventoryItemCount(targetSaveId, items.Select(i => (i.Item, i.Version)).ToArray(), flags);

        return new(
            type: DataActionType.MOVE_ITEM,
            parameters: [
                firstItem.Item, firstItem.Version,
                sourceSaveId == null ? null : firstItem.Version, null,
                targetItems.First().Version, null,
            ]
        );
    }

    private async Task<DataActionPayload> PkmToInventory(
        uint? sourceSaveId, string[] sourcePkmIds,
        uint? targetSaveId,
        DataUpdateFlags flags
    )
    {
        var items = await PickPkmItem(sourceSaveId, sourcePkmIds, flags);
        var firstItem = items.First();

        var targetItems = IncrementInventoryItemCount(targetSaveId, items.Select(i => (i.Item, i.Version)).ToArray(), flags);

        return new(
            type: DataActionType.MOVE_ITEM,
            parameters: [
                firstItem.Item, firstItem.Version,
                sourceSaveId == null ? null : firstItem.Version, firstItem.PkmName,
                targetItems.First().Version, null,
            ]
        );
    }

    private InventoryItemDTO IncrementInventoryItemCount(uint? saveId, int srcItem, GameVersion srcVersion, DataUpdateFlags flags)
    {
        return IncrementInventoryItemCount(saveId, [(srcItem, srcVersion)], flags).First();
    }

    private InventoryItemDTO[] IncrementInventoryItemCount(uint? saveId, (int Item, GameVersion Version)[] srcItems, DataUpdateFlags flags)
    {
        if (saveId == null)
        {
            throw new NotImplementedException();
        }

        var saveLoader = savesLoadersService.GetLoadersRequired((uint)saveId);

        flags.Saves.UseSave((uint)saveId).SaveInventoryItems = true;

        return srcItems.Select(item => saveLoader.Inventory.IncrementItemCount(item.Item, item.Version)).ToArray();
    }

    private InventoryItemDTO DecrementInventoryItemCount(uint? saveId, string itemId, DataUpdateFlags flags)
    {
        return DecrementInventoryItemCount(saveId, [itemId], flags).First();
    }

    private InventoryItemDTO[] DecrementInventoryItemCount(uint? saveId, string[] itemIds, DataUpdateFlags flags)
    {
        if (saveId == null)
        {
            throw new NotImplementedException();
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
            var pkm = await pkmVariantLoader.GetPKM(variant);

            if (!pkm.CanHeldItem)
                throw new ArgumentException();

            var variantItem = PKMConverterUtils.ConvertHeldItem(srcItem, srcVersion, pkm.Context.GetSingleGameVersion());
            ArgumentNullException.ThrowIfNull(variantItem);

            pkm = pkm.Update(pkm =>
            {
                pkm.HeldItem = (int)variantItem;
            });
            await pkmVariantLoader.UpdateEntity(variant, pkm);
            await editPkmVariantAction.ShareChangesToVariantsAndAttached(variant, pkm, flags);

            return;
        }

        var saveLoader = savesLoadersService.GetLoadersRequired((uint)saveId);
        var dto = saveLoader.Pkms.GetDto(pkmId);
        ArgumentNullException.ThrowIfNull(dto);

        if (!dto.CanHeldItem)
            throw new ArgumentException();

        var saveItem = PKMConverterUtils.ConvertHeldItem(srcItem, srcVersion, dto.ContextVersion);
        ArgumentNullException.ThrowIfNull(saveItem);

        dto = dto with
        {
            Pkm = dto.Pkm.Update(pkm =>
            {
                pkm.HeldItem = (int)saveItem;
            })
        };
        saveLoader.Pkms.WriteDto(dto);
        flags.Saves.UseSave((uint)saveId).SavePkms.Ids.Add(dto.Id);
        await editPkmSaveAction.ShareChangesToAttached(dto);
    }

    private async Task<(int Item, GameVersion Version, string PkmName)[]> PickPkmItem(uint? saveId, string[] pkmIds, DataUpdateFlags flags)
    {
        if (saveId == null)
        {
            var variants = await pkmVariantLoader.GetEntitiesByIds(pkmIds);

            List<(int Item, GameVersion Version, string PkmName)> variantResults = [];
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

                variantResults.Add((variantItem, pkm.Context.GetSingleGameVersion(), pkm.Nickname));
            }
            return variantResults.ToArray();
        }

        var saveLoader = savesLoadersService.GetLoadersRequired((uint)saveId);

        List<(int Item, GameVersion Version, string PkmName)> saveResults = [];
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

            saveResults.Add((saveItem, dto.ContextVersion, dto.Nickname));
        }

        return saveResults.ToArray();
    }

    private async Task<(int Item, GameVersion Version, string PkmName)> PickPkmItem(uint? saveId, string pkmId, DataUpdateFlags flags)
    {
        return (await PickPkmItem(saveId, [pkmId], flags)).First();
    }
}
