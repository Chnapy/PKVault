
public class DeletePkmVersionAction : DataAction
{
    private readonly string pkmVersionId;

    public DeletePkmVersionAction(string _pkmVersionId)
    {
        pkmVersionId = _pkmVersionId;
    }

    public override DataActionPayload GetPayload()
    {
        return new DataActionPayload
        {
            type = DataActionType.DELETE_PKM_VERSION,
            parameters = [pkmVersionId]
        };
    }

    public override async Task Execute(DataEntityLoaders loaders)
    {
        var pkmVersion = loaders.pkmVersionLoader.GetEntity(pkmVersionId);
        var pkm = loaders.pkmLoader.GetEntity(pkmVersion.PkmId);

        if (pkm.SaveId != null)
        {
            throw new Exception($"Cannot delete pkm-version attached in save, pkm-version.id={pkmVersionId}");
        }

        loaders.pkmVersionLoader.DeleteEntity(pkmVersionId);

        var relatedPkmVersions = loaders.pkmVersionLoader.GetAllEntities().FindAll(value => value.PkmId == pkm.Id);
        if (relatedPkmVersions.Count == 0)
        {
            loaders.pkmLoader.DeleteEntity(pkm.Id);
        }
    }
}
