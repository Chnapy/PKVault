public record MainDeleteBankActionInput(string bankId);

public class MainDeleteBankAction(
    IBankLoader bankLoader, IBoxLoader boxLoader
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

        // boxes are deleted by cascade
        // still have to track them
        (await boxLoader.GetEntitiesByBank(input.bankId)).Values.ToList()
            .ForEach(box => flags.MainBoxes.Ids.Add(box.Id));

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
