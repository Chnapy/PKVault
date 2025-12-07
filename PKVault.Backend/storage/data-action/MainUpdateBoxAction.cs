public class MainUpdateBoxAction(string boxId, string boxName, int order, string bankId) : DataAction
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

        var box = loaders.boxLoader.GetEntity(boxId);

        var boxOldName = box!.Name;
        box.Name = boxName;
        box.Order = order;
        box.BankId = bankId;

        loaders.boxLoader.WriteEntity(box);

        MainCreateBoxAction.NormalizeBoxOrders(loaders.boxLoader);

        flags.MainBoxes = true;
        flags.MainBanks = true;

        return new()
        {
            type = DataActionType.MAIN_UPDATE_BOX,
            parameters = [boxOldName, boxName]
        };
    }
}
