namespace PKVault.Core;

public record MoveItemBankActionInput(
    uint? sourceSaveId,
    string[] sourcePkmIds, string[] sourceItemIds,

    string bankId);

public class MoveItemBankAction(
    IBoxLoader boxLoader, IBankLoader bankLoader,
    IInventoryLoader inventoryLoader, MoveItemAction moveItemAction
) : DataAction<MoveItemBankActionInput>
{
    protected override async Task<DataActionPayload> Execute(MoveItemBankActionInput input, DataUpdateFlags flags)
    {
        if (input.sourcePkmIds.Length == 0 && input.sourceItemIds.Length == 0)
            throw new ArgumentException($"Pkm ids + item ids cannot be empty");

        if (input.sourcePkmIds.Length > 0 && input.sourceItemIds.Length > 0)
            throw new ArgumentException($"Pkm ids + item ids cannot be filled");

        var bank = await bankLoader.GetEntityRequired(input.bankId);
        if (bank.IsExternal)
            throw new ArgumentException($"External bank cannot be used as move target");

        var inventoryBoxes = (await boxLoader.GetEntitiesByBank(input.bankId)).Values
            .Where(box => box.Type == BoxType.Inventory);

        int? targetBoxId = null;
        foreach (var box in inventoryBoxes)
        {
            var maxSlot = await inventoryLoader.GetMaxBoxSlot(box.IdInt);
            if (maxSlot < box.SlotCount - 1)
            {
                targetBoxId = box.IdInt;
                break;
            }
        }
        ArgumentNullException.ThrowIfNull(targetBoxId);

        if (input.sourceItemIds.Length > 0)
            return await moveItemAction.InventoryToInventory(input.sourceSaveId, input.sourceItemIds, null, targetBoxId, flags);

        if (input.sourcePkmIds.Length > 0)
            return await moveItemAction.PkmToInventory(input.sourceSaveId, input.sourcePkmIds, null, targetBoxId, flags);

        throw new ArgumentException($"Wrong arguments");
    }
}
