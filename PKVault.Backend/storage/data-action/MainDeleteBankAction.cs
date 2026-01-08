public class MainDeleteBankAction(string bankId) : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var bank = loaders.bankLoader.GetEntity(bankId);

        if (bank!.IsDefault)
        {
            throw new ArgumentException("Bank being default cannot be deleted");
        }

        var boxes = loaders.boxLoader.GetAllEntities().Values.ToList().FindAll(box => box.BankId == bankId);
        foreach (var box in boxes)
        {
            await new MainDeleteBoxAction(box.Id).ExecuteWithPayload(loaders, flags);
        }

        loaders.bankLoader.DeleteEntity(bankId);
        loaders.bankLoader.NormalizeOrders();

        return new()
        {
            type = DataActionType.MAIN_DELETE_BANK,
            parameters = [bank.Name]
        };
    }
}
