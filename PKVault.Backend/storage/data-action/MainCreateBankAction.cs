public record MainCreateBankActionInput();

public class MainCreateBankAction(
    IBankLoader bankLoader,
    MainCreateBoxAction mainCreateBoxAction
) : DataAction<MainCreateBankActionInput>
{
    protected override async Task<DataActionPayload> Execute(MainCreateBankActionInput input, DataUpdateFlags flags)
    {
        var banks = await bankLoader.GetAllEntities();
        var maxId = await bankLoader.GetMaxId();
        var maxOrder = await bankLoader.GetMaxOrder();

        string GetNewName()
        {
            var i = banks.Count + 1;

            while (banks.Values.Any(bank => bank.Name == $"Bank {i}"))
            {
                i++;
            }

            return $"Bank {i}";
        }

        var id = maxId + 1;
        var order = maxOrder + 1;
        var name = GetNewName();

        await bankLoader.AddEntity(new()
        {
            Id = id.ToString(),
            IdInt = id,
            Name = name,
            IsDefault = false,
            Order = order, // normalized just after
            View = new(MainBoxIds: [], Saves: [])
        });
        await bankLoader.NormalizeOrders();

        await mainCreateBoxAction.CreateBox(new(id.ToString(), null));

        return new(
            type: DataActionType.MAIN_CREATE_BANK,
            parameters: [name]
        );
    }
}
