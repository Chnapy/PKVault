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

        var box = boxLoader.GetEntity(input.boxId);

        var order = input.order;

        if (box!.BankId != input.bankId)
        {
            var bankBoxes = boxLoader.GetAllEntities().Values.ToList().FindAll(box => box.BankId == box.BankId);
            if (bankBoxes.Count <= 1)
            {
                throw new ArgumentException($"Bank must keep at least 1 box");
            }

            // edit previous bank view: remove this box
            if (box.BankId != null)
            {
                var bank = bankLoader.GetEntity(box.BankId);
                if (bank.View.MainBoxIds.Contains(int.Parse(box.Id)))
                {
                    bank = bankLoader.WriteEntity(bank with
                    {
                        View = new(
                            MainBoxIds: [.. bank.View.MainBoxIds.ToList().FindAll(id => id != int.Parse(box.Id))],
                            Saves: bank.View.Saves
                        )
                    });
                }
            }

            // if bank change, set box as last one
            order = 999;
        }

        if (box.SlotCount != input.slotCount)
        {
            var boxPkms = pkmVersionLoader.GetEntitiesByBox(int.Parse(box.Id));
            if (boxPkms.Any(pkm =>
                // Key = boxSlot
                pkm.Key >= input.slotCount - 1
            ))
            {
                throw new ArgumentException($"Box slot count change is blocked by a pkm");
            }
        }

        var boxOldName = box.Name;

        boxLoader.WriteEntity(box with
        {
            Type = input.type,
            Name = input.boxName,
            Order = order,
            BankId = input.bankId,
            SlotCount = input.slotCount,
        });
        boxLoader.NormalizeOrders();

        return new(
            type: DataActionType.MAIN_UPDATE_BOX,
            parameters: [boxOldName, input.boxName]
        );
    }
}
