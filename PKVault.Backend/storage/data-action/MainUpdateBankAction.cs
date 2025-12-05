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
                b.IsDefault = false;
                loaders.bankLoader.WriteEntity(b);
            });

            bank.IsDefault = isDefault;
        }

        bank.Name = bankName;
        bank.Order = order;
        bank.View = view;

        loaders.bankLoader.WriteEntity(bank);

        flags.MainBanks = true;

        return new()
        {
            type = DataActionType.MAIN_UPDATE_BANK,
            parameters = [bankName, isDefault, view]
        };
    }
}
