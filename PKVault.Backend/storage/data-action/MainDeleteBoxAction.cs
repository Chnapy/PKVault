public class MainDeleteBoxAction : DataAction
{
    private readonly string boxId;

    public MainDeleteBoxAction(string _boxId)
    {
        boxId = _boxId;
    }

    public override DataActionPayload GetPayload()
    {
        return new DataActionPayload
        {
            type = DataActionType.MAIN_DELETE_BOX,
            parameters = [boxId]
        };
    }

    public override async Task Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var box = await loaders.boxLoader.GetDto(boxId);
        var allPkms = await loaders.pkmLoader.GetAllDtos();

        if (allPkms.Any(pkm => pkm.BoxId == box.IdInt))
        {
            throw new ArgumentException($"Cannot delete box with pkm inside");
        }

        loaders.boxLoader.DeleteEntity(boxId);

        flags.MainBoxes = true;
    }
}
