
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

    public override async Task Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var pkmVersion = await loaders.pkmVersionLoader.GetDto(pkmVersionId);
        var pkm = pkmVersion.PkmDto;

        if (pkm.SaveId != null)
        {
            throw new Exception($"Cannot delete pkm-version attached in save, pkm-version.id={pkmVersionId}");
        }

        flags.MainPkmVersions |= loaders.pkmVersionLoader.DeleteEntity(pkmVersionId);

        var relatedPkmVersions = (await loaders.pkmVersionLoader.GetAllDtos()).FindAll(value => value.PkmDto.Id == pkm.Id);
        if (relatedPkmVersions.Count == 0)
        {
            flags.MainPkms |= loaders.pkmLoader.DeleteEntity(pkm.Id);
        }
    }
}
