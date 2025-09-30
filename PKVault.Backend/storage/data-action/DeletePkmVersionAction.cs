public class DeletePkmVersionAction(string pkmVersionId) : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var pkmVersion = await loaders.pkmVersionLoader.GetDto(pkmVersionId);
        var pkm = pkmVersion!.PkmDto;

        if (pkm.SaveId != null)
        {
            throw new ArgumentException($"Cannot delete pkm-version attached in save, pkm-version.id={pkmVersionId}");
        }

        flags.MainPkmVersions |= loaders.pkmVersionLoader.DeleteEntity(pkmVersionId);

        var relatedPkmVersions = (await loaders.pkmVersionLoader.GetAllDtos()).FindAll(value => value.PkmDto.Id == pkm.Id);
        if (relatedPkmVersions.Count == 0)
        {
            flags.MainPkms |= loaders.pkmLoader.DeleteEntity(pkm.Id);
        }

        return new()
        {
            type = DataActionType.DELETE_PKM_VERSION,
            parameters = [pkmVersion.Nickname, pkmVersion.Generation]
        };
    }
}
