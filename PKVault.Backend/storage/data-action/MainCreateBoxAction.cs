public class MainCreateBoxAction(string boxName, string bankId) : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        if (boxName.Length == 0)
        {
            throw new ArgumentException($"Box name cannot be empty");
        }

        if (boxName.Length > 64)
        {
            throw new ArgumentException($"Box name cannot be > 64 characters");
        }

        var boxes = loaders.boxLoader.GetAllDtos();
        var maxId = boxes.Select(box => box.IdInt).Max();
        var maxOrder = boxes.Select(box => box.Order).Max();

        var id = maxId + 1;
        var order = maxOrder + 1;

        loaders.boxLoader.WriteDto(new()
        {
            BoxEntity = new()
            {
                Id = id.ToString(),
                Name = boxName,
                Order = order,
                BankId = bankId
            }
        });

        flags.MainBoxes = true;
        flags.MainBanks = true;

        return new()
        {
            type = DataActionType.MAIN_CREATE_BOX,
            parameters = [boxName]
        };
    }
}
