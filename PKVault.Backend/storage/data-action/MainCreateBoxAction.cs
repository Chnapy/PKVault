public class MainCreateBoxAction(string bankId) : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var allBoxes = loaders.boxLoader.GetAllEntities().Values.ToList();
        var boxes = allBoxes.FindAll(box => box.BankId == bankId);
        var maxId = allBoxes.Select(box => box.IdInt).Max();
        var maxOrder = boxes.Count == 0 ? 0 : boxes.Select(box => box.Order).Max();

        string GetNewName()
        {
            var i = boxes.Count + 1;

            while (boxes.Any(box => box.Name == $"Box {i}"))
            {
                i++;
            }

            return $"Box {i}";
        }

        var id = maxId + 1;
        var order = maxOrder + 1;
        var name = GetNewName();

        loaders.boxLoader.WriteDto(new()
        {
            BoxEntity = new()
            {
                Id = id.ToString(),
                Name = name,
                Order = order,
                BankId = bankId
            }
        });

        flags.MainBoxes = true;
        flags.MainBanks = true;

        return new()
        {
            type = DataActionType.MAIN_CREATE_BOX,
            parameters = [name]
        };
    }
}
