public record MainDeleteBankActionInput(string bankId);

public class MainDeleteBankAction(
    IBankLoader bankLoader, IBoxLoader boxLoader, MainDeleteBoxAction mainDeleteBoxAction
) : DataAction<MainDeleteBankActionInput>
{
    protected override async Task<DataActionPayload?> Execute(MainDeleteBankActionInput input, DataUpdateFlags flags)
    {
        var bank = bankLoader.GetEntity(input.bankId);

        var banksCount = bankLoader.GetAllEntities().Count;
        if (banksCount < 2)
        {
            throw new ArgumentException("Last Bank cannot be deleted");
        }

        var boxes = boxLoader.GetAllEntities().Values.ToList().FindAll(box => box.BankId == input.bankId);
        foreach (var box in boxes)
        {
            await mainDeleteBoxAction.ExecuteWithPayload(new(box.Id), flags);
        }

        bankLoader.DeleteEntity(input.bankId);
        if (bank.IsDefault)
        {
            var newDefaultBank = bankLoader.GetAllEntities().First().Value;
            bankLoader.WriteEntity(newDefaultBank with { IsDefault = true });
        }

        bankLoader.NormalizeOrders();

        return new(
            type: DataActionType.MAIN_DELETE_BANK,
            parameters: [bank.Name]
        );
    }
}
