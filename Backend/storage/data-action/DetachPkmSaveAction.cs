
public class DetachPkmSaveAction : DataAction
{
    private readonly string pkmId;

    public DetachPkmSaveAction(string _pkmId)
    {
        pkmId = _pkmId;
    }

    public override DataActionPayload GetPayload()
    {
        return new DataActionPayload
        {
            type = DataActionType.DETACH_PKM_SAVE,
            parameters = [pkmId]
        };
    }

    public override async Task Execute(DataEntityLoaders loaders)
    {
        var pkm = loaders.pkmLoader.GetDto(pkmId);
        pkm.Save = default;
        await loaders.pkmLoader.WriteDto(pkm);
    }
}
