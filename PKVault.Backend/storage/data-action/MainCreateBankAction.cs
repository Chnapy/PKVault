public class MainCreateBankAction : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var banks = loaders.bankLoader.GetAllDtos();
        var maxId = banks.Select(bank => bank.IdInt).Max();
        var maxOrder = banks.Select(bank => bank.Order).Max();

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

        loaders.bankLoader.WriteEntity(new()
        {
            Id = id.ToString(),
            Name = name,
            IsDefault = false,
            Order = order,
            View = new(MainBoxIds: [], Saves: [])
        });

        flags.MainBanks = true;

        await new MainCreateBoxAction("Box 1", id.ToString()).ExecuteWithPayload(loaders, flags);

        return new()
        {
            type = DataActionType.MAIN_CREATE_BANK,
            parameters = [name]
        };
    }
}
