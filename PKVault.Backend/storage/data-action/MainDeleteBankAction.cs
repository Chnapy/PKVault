public record MainDeleteBankActionInput(string bankId);

public class MainDeleteBankAction(
    IBankLoader bankLoader, IBoxLoader boxLoader, MainDeleteBoxAction mainDeleteBoxAction
) : DataAction<MainDeleteBankActionInput>
{
    protected override async Task<DataActionPayload> Execute(MainDeleteBankActionInput input, DataUpdateFlags flags)
    {
        var bank = await bankLoader.GetEntity(input.bankId);

        var banksCount = await bankLoader.Count();
        if (banksCount < 2)
        {
            throw new ArgumentException("Last Bank cannot be deleted");
        }

        var boxes = (await boxLoader.GetEntitiesByBank(input.bankId)).Values;
        foreach (var box in boxes)
        {
            await mainDeleteBoxAction.ExecuteWithPayload(new(box.Id), flags);
        }

        await bankLoader.DeleteEntity(bank);
        if (bank.IsDefault)
        {
            var newDefaultBank = await bankLoader.First();
            newDefaultBank.IsDefault = true;
            await bankLoader.UpdateEntity(newDefaultBank);
        }

        await bankLoader.NormalizeOrders();

        return new(
            type: DataActionType.MAIN_DELETE_BANK,
            parameters: [bank.Name]
        );
    }
}
