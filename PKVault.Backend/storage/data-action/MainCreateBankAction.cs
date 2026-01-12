public class MainCreateBankAction : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var banks = loaders.bankLoader.GetAllDtos();
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

        loaders.bankLoader.WriteEntity(new(
            SchemaVersion: loaders.bankLoader.GetLastSchemaVersion(),
            Id: id.ToString(),
            Name: name,
            IsDefault: false,
            Order: order, // normalized just after
            View: new(MainBoxIds: [], Saves: [])
        ));
        loaders.bankLoader.NormalizeOrders();

        MainCreateBoxAction.CreateBox(loaders, flags, id.ToString(), null);

        return new(
            type: DataActionType.MAIN_CREATE_BANK,
            parameters: [name]
        );
    }
}
