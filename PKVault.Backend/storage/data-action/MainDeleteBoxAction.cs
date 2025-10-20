public class MainDeleteBoxAction(string boxId) : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var box = loaders.boxLoader.GetDto(boxId);
        var allPkms = loaders.pkmLoader.GetAllDtos();

        if (allPkms.Any(pkm => pkm.BoxId == box!.IdInt))
        {
            throw new ArgumentException($"Cannot delete box with pkm inside");
        }

        loaders.boxLoader.DeleteEntity(boxId);

        flags.MainBoxes = true;

        return new()
        {
            type = DataActionType.MAIN_DELETE_BOX,
            parameters = [box!.Name]
        };
    }
}
