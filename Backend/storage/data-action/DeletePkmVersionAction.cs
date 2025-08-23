
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
        var pkmVersion = loaders.pkmVersionLoader.GetDto(pkmVersionId);
        var pkm = pkmVersion.PkmDto;

        if (pkm.SaveId != null)
        {
            throw new Exception($"Cannot delete pkm-version attached in save, pkm-version.id={pkmVersionId}");
        }

        loaders.pkmVersionLoader.DeleteDto(pkmVersionId);

        var relatedPkmVersions = loaders.pkmVersionLoader.GetAllDtos().FindAll(value => value.PkmDto.Id == pkm.Id);
        if (relatedPkmVersions.Count == 0)
        {
            loaders.pkmLoader.DeleteDto(pkm.Id);
        }
    }
}
