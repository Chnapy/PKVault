public class MainCreateBoxAction : DataAction
{
    private readonly string boxName;

    public MainCreateBoxAction(string _boxName)
    {
        boxName = _boxName;
    }

    public override DataActionPayload GetPayload()
    {
        return new DataActionPayload
        {
            type = DataActionType.MAIN_CREATE_BOX,
            parameters = [boxName]
        };
    }

    public override async Task Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var boxes = await loaders.boxLoader.GetAllDtos();
        var maxId = boxes.Select(box => box.IdInt).Max();

        var id = maxId + 1;

        loaders.boxLoader.WriteDto(new()
        {
            BoxEntity = new()
            {
                Id = id.ToString(),
                Name = boxName,
            }
        });

        flags.MainBoxes = true;
    }
}
