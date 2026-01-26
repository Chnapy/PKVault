public record MainCreateBankActionInput();

public class MainCreateBankAction(
    IBankLoader bankLoader,
    MainCreateBoxAction mainCreateBoxAction
) : DataAction<MainCreateBankActionInput>
{
    protected override async Task<DataActionPayload> Execute(MainCreateBankActionInput input, DataUpdateFlags flags)
    {
        var banks = await bankLoader.GetAllDtos();
        var maxId = banks.Max(bank => bank.IdInt);
        var maxOrder = banks.Max(bank => bank.Order);

        string GetNewName()
        {
            var i = banks.Count + 1;

            while (banks.Any(bank => bank.Name == $"Bank {i}"))
            {
                i++;
            }

            return $"Bank {i}";
        }

        var id = maxId + 1;
        var order = maxOrder + 1;
        var name = GetNewName();

        await bankLoader.WriteEntity(new(
            Id: id.ToString(),
            Name: name,
            IsDefault: false,
            Order: order, // normalized just after
            View: new(MainBoxIds: [], Saves: [])
        ));
        await bankLoader.NormalizeOrders();

        await mainCreateBoxAction.CreateBox(new(id.ToString(), null));

        return new(
            type: DataActionType.MAIN_CREATE_BANK,
            parameters: [name]
        );
    }
}
