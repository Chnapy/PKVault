public class MainUpdateBoxAction(string boxId, string boxName) : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var box = await loaders.boxLoader.GetDto(boxId);

        var boxOldName = box.Name;
        box.BoxEntity.Name = boxName;

        loaders.boxLoader.WriteDto(box);

        flags.MainBoxes = true;

        return new()
        {
            type = DataActionType.MAIN_UPDATE_BOX,
            parameters = [boxOldName, boxName]
        };
    }
}
