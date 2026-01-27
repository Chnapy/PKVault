public record MainUpdateBoxActionInput(string boxId, string boxName, int order, string bankId, int slotCount, BoxType type);

public class MainUpdateBoxAction(
    IBoxLoader boxLoader, IBankLoader bankLoader, IPkmVersionLoader pkmVersionLoader
) : DataAction<MainUpdateBoxActionInput>
{
    protected override async Task<DataActionPayload> Execute(MainUpdateBoxActionInput input, DataUpdateFlags flags)
    {
        if (input.boxName.Length == 0)
        {
            throw new ArgumentException($"Box name cannot be empty");
        }

        if (input.boxName.Length > 64)
        {
            throw new ArgumentException($"Box name cannot be > 64 characters");
        }

        if (input.slotCount < 1 || input.slotCount > 300)
        {
            throw new ArgumentException($"Box slot count should be between 1-300");
        }

        var box = await boxLoader.GetEntity(input.boxId);

        var order = input.order;

        if (box!.BankId != input.bankId)
        {
            var bankBoxes = (await boxLoader.GetEntitiesByBank(box.BankId)).Values;
            if (bankBoxes.Count() <= 1)
            {
                throw new ArgumentException($"Bank must keep at least 1 box");
            }

            // edit previous bank view: remove this box
            if (box.BankId != null)
            {
                var bank = await bankLoader.GetEntity(box.BankId);
                if (bank.View.MainBoxIds.Contains(box.IdInt))
                {
                    bank.View = new(
                        MainBoxIds: [.. bank.View.MainBoxIds.ToList().FindAll(id => id != box.IdInt)],
                        Saves: bank.View.Saves
                    );
                    await bankLoader.UpdateEntity(bank);
                }
            }

            // if bank change, set box as last one
            order = 999;
        }

        if (box.SlotCount != input.slotCount)
        {
            var boxPkms = await pkmVersionLoader.GetEntitiesByBox(box.IdInt);
            if (boxPkms.Any(pkm =>
                // Key = boxSlot
                pkm.Key >= input.slotCount - 1
            ))
            {
                throw new ArgumentException($"Box slot count change is blocked by a pkm");
            }
        }

        var boxOldName = box.Name;

        box.Type = input.type;
        box.Name = input.boxName;
        box.Order = order;
        box.BankId = input.bankId;
        box.SlotCount = input.slotCount;
        await boxLoader.UpdateEntity(box);
        await boxLoader.NormalizeOrders();

        return new(
            type: DataActionType.MAIN_UPDATE_BOX,
            parameters: [boxOldName, input.boxName]
        );
    }
}
