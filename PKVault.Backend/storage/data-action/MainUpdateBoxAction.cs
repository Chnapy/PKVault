public class MainUpdateBoxAction(string boxId, string boxName, int order, string bankId, int slotCount, BoxType type) : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        if (boxName.Length == 0)
        {
            throw new ArgumentException($"Box name cannot be empty");
        }

        if (boxName.Length > 64)
        {
            throw new ArgumentException($"Box name cannot be > 64 characters");
        }

        if (slotCount < 1 || slotCount > 300)
        {
            throw new ArgumentException($"Box slot count should be between 1-300");
        }

        var box = loaders.boxLoader.GetEntity(boxId);

        if (box!.BankId != bankId)
        {
            var bankBoxes = loaders.boxLoader.GetAllEntities().Values.ToList().FindAll(box => box.BankId == box.BankId);
            if (bankBoxes.Count <= 1)
            {
                throw new ArgumentException($"Bank must keep at least 1 box");
            }

            // edit previous bank view: remove this box
            if (box.BankId != null)
            {
                var bank = loaders.bankLoader.GetEntity(box.BankId);
                if (bank.View.MainBoxIds.Contains(box.IdInt))
                {
                    bank.View = new(
                        MainBoxIds: [.. bank.View.MainBoxIds.ToList().FindAll(id => id != box.IdInt)],
                        Saves: bank.View.Saves
                    );
                    loaders.bankLoader.WriteEntity(bank);
                }
            }

            // if bank change, set box as last one
            order = 999;
        }

        if (box.SlotCount != slotCount)
        {
            var pkms = loaders.pkmLoader.GetAllEntities().Values.ToList().FindAll(pkm => pkm.BoxId == box.IdInt);
            if (pkms.Any(pkm => pkm.BoxSlot >= slotCount - 1))
            {
                throw new ArgumentException($"Box slot count change is blocked by a pkm");
            }
        }

        var boxOldName = box.Name;
        box.Type = type;
        box.Name = boxName;
        box.Order = order;
        box.BankId = bankId;
        box.SlotCount = slotCount;

        loaders.boxLoader.WriteEntity(box);
        loaders.boxLoader.NormalizeOrders();

        return new()
        {
            type = DataActionType.MAIN_UPDATE_BOX,
            parameters = [boxOldName, boxName]
        };
    }
}
