public class MainDeleteBankAction(string bankId) : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var bank = loaders.bankLoader.GetEntity(bankId);

        var banksCount = loaders.bankLoader.GetAllEntities().Count;
        if (banksCount < 2)
        {
            throw new ArgumentException("Last Bank cannot be deleted");
        }

        var boxes = loaders.boxLoader.GetAllEntities().Values.ToList().FindAll(box => box.BankId == bankId);
        foreach (var box in boxes)
        {
            await new MainDeleteBoxAction(box.Id).ExecuteWithPayload(loaders, flags);
        }

        loaders.bankLoader.DeleteEntity(bankId);
        if (bank.IsDefault)
        {
            var newDefaultBank = loaders.bankLoader.GetAllEntities().First().Value;
            loaders.bankLoader.WriteEntity(newDefaultBank with { IsDefault = true });
        }

        loaders.bankLoader.NormalizeOrders();

        return new(
            type: DataActionType.MAIN_DELETE_BANK,
            parameters: [bank.Name]
        );
    }
}
