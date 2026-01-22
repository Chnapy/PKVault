
public class DetachPkmSaveAction(string[] pkmVersionIds) : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        if (pkmVersionIds.Length == 0)
        {
            throw new ArgumentException($"Pkm version ids cannot be empty");
        }

        DataActionPayload act(string pkmVersionId)
        {
            var pkmVersionEntity = loaders.pkmVersionLoader.GetEntity(pkmVersionId);
            var oldSaveId = pkmVersionEntity!.AttachedSaveId;
            if (oldSaveId != null)
            {
                loaders.pkmVersionLoader.WriteEntity(pkmVersionEntity with
                {
                    AttachedSaveId = null,
                    AttachedSavePkmIdBase = null
                });
            }

            var pkm = loaders.pkmVersionLoader.GetPkmVersionEntityPkm(pkmVersionEntity);

            var pkmNickname = pkm.Nickname;
            var saveExists = loaders.saveLoadersDict.TryGetValue(oldSaveId ?? 0, out var saveLoaders);

            return new(
                type: DataActionType.DETACH_PKM_SAVE,
                parameters: [saveExists ? saveLoaders.Save.Version : null, pkmNickname]
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
