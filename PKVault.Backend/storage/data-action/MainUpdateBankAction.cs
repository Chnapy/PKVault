public class MainUpdateBankAction(string bankId, string bankName, bool isDefault, int order, BankEntity.BankView view) : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        if (bankName.Length == 0)
        {
            throw new ArgumentException($"Bank name cannot be empty");
        }

        if (bankName.Length > 64)
        {
            throw new ArgumentException($"Bank name cannot be > 64 characters");
        }

        var bank = loaders.bankLoader.GetEntity(bankId);

        if (bank!.IsDefault && !isDefault)
        {
            throw new ArgumentException($"Bank is-default cannot be unset manually");
        }

        if (!bank.IsDefault && isDefault)
        {
            var otherDefaultBanks = loaders.bankLoader.GetAllEntities().Values.ToList().FindAll(b => b.Id != bankId && b.IsDefault);

            otherDefaultBanks.ForEach(b =>
            {
                loaders.bankLoader.WriteEntity(b with { IsDefault = false });
            });

            bank = loaders.bankLoader.WriteEntity(bank with { IsDefault = isDefault });
        }

        var relatedBoxesIds = loaders.boxLoader.GetAllEntities().Values.ToList()
            .FindAll(box => box.BankId == bankId)
            .Select(box => box.IdInt).ToArray();

        // view check: only allow boxes attached to this bank
        view = new(
            MainBoxIds: [.. view.MainBoxIds.ToList().FindAll(id => relatedBoxesIds.Contains(id))],
            Saves: view.Saves
        );

        bank = loaders.bankLoader.WriteEntity(bank with
        {
            Name = bankName,
            Order = order,
            View = view
        });

        loaders.bankLoader.WriteEntity(bank);
        loaders.bankLoader.NormalizeOrders();

        return new()
        {
            type = DataActionType.MAIN_UPDATE_BANK,
            parameters = [bankName, isDefault, view]
        };
    }
}
