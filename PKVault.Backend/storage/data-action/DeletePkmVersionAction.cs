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

            loaders.pkmVersionLoader.DeleteEntity(pkmVersionId);

            if (pkmVersion.IsMain)
            {
                var versions = loaders.pkmVersionLoader.GetEntitiesByBox(pkmVersion.BoxId, pkmVersion.BoxSlot);
                if (versions.Count > 0)
                {
                    var newMainVersion = versions.First().Value;
                    loaders.pkmVersionLoader.WriteEntity(newMainVersion with { IsMain = true });
                }
            }

            return new(
                type: DataActionType.DELETE_PKM_VERSION,
                parameters: [pkmVersion.Nickname, pkmVersion.Generation]
            );
        }

        List<DataActionPayload> payloads = [];
        foreach (var pkmVersionId in pkmVersionIds)
        {
            payloads.Add(act(pkmVersionId));
        }

        return payloads[0];
    }
}
