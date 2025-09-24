public class MainUpdateBoxAction : DataAction
{
    private readonly string boxId;
    private readonly string boxName;

    public MainUpdateBoxAction(string _boxId, string _boxName)
    {
        boxId = _boxId;
        boxName = _boxName;
    }

    public override DataActionPayload GetPayload()
    {
        return new DataActionPayload
        {
            type = DataActionType.MAIN_UPDATE_BOX,
            parameters = [boxId, boxName]
        };
    }

    public override async Task Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var box = await loaders.boxLoader.GetDto(boxId);

        box.BoxEntity.Name = boxName;

        loaders.boxLoader.WriteDto(box);

        flags.MainBoxes = true;
    }
}
