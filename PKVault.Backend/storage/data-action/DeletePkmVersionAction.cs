public class DeletePkmVersionAction(string[] pkmVersionIds) : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        if (pkmVersionIds.Length == 0)
        {
            throw new ArgumentException($"Pkm version ids cannot be empty");
        }

        DataActionPayload act(string pkmVersionId)
        {
            var pkmVersion = loaders.pkmVersionLoader.GetDto(pkmVersionId);
            var pkm = pkmVersion!.PkmDto;

            if (pkm.SaveId != null)
            {
                throw new ArgumentException($"Cannot delete pkm-version attached in save, pkm-version.id={pkmVersionId}");
            }

            flags.MainPkmVersions |= loaders.pkmVersionLoader.DeleteEntity(pkmVersionId);

            var relatedPkmVersions = loaders.pkmVersionLoader.GetEntitiesByPkmId(pkm.Id);
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

        List<DataActionPayload> payloads = [];
        foreach (var pkmVersionId in pkmVersionIds)
        {
            payloads.Add(act(pkmVersionId));
        }

        return payloads[0];
    }
}
