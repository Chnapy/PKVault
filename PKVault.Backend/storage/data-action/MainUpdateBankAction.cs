public record MainUpdateBankActionInput(string bankId, string bankName, bool isDefault, int order, BankEntity.BankView view);

public class MainUpdateBankAction(
    IBankLoader bankLoader, IBoxLoader boxLoader
) : DataAction<MainUpdateBankActionInput>
{
    protected override async Task<DataActionPayload> Execute(MainUpdateBankActionInput input, DataUpdateFlags flags)
    {
        if (input.bankName.Length == 0)
        {
            throw new ArgumentException($"Bank name cannot be empty");
        }

        if (input.bankName.Length > 64)
        {
            throw new ArgumentException($"Bank name cannot be > 64 characters");
        }

        var bank = await bankLoader.GetEntity(input.bankId);

        if (bank!.IsDefault && !input.isDefault)
        {
            throw new ArgumentException($"Bank is-default cannot be unset manually");
        }

        if (!bank.IsDefault && input.isDefault)
        {
            var otherDefaultBanks = (await bankLoader.GetAllEntities()).Values.ToList().FindAll(b => b.Id != input.bankId && b.IsDefault);

            foreach (var b in otherDefaultBanks)
            {
                await bankLoader.WriteEntity(b with { IsDefault = false });
            }

            bank = await bankLoader.WriteEntity(bank with { IsDefault = input.isDefault });
        }

        var relatedBoxesIds = (await boxLoader.GetAllEntities()).Values.ToList()
            .FindAll(box => box.BankId == input.bankId)
            .Select(box => int.Parse(box.Id)).ToArray();

        // view check: only allow boxes attached to this bank
        BankEntity.BankView view = new(
            MainBoxIds: [.. input.view.MainBoxIds.ToList().FindAll(id => relatedBoxesIds.Contains(id))],
            Saves: input.view.Saves
        );

        bank = await bankLoader.WriteEntity(bank with
        {
            Name = input.bankName,
            Order = input.order,
            View = view
        });

        await bankLoader.WriteEntity(bank);
        await bankLoader.NormalizeOrders();

        return new(
            type: DataActionType.MAIN_UPDATE_BANK,
            parameters: [input.bankName, input.isDefault, view]
        );
    }
}
