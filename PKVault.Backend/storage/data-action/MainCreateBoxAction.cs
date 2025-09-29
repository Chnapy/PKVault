public class MainCreateBoxAction(string boxName) : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
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

        return new()
        {
            type = DataActionType.MAIN_CREATE_BOX,
            parameters = [boxName]
        };
    }
}
