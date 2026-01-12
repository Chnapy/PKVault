
public class DetachPkmSaveAction(string[] pkmIds) : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        if (pkmIds.Length == 0)
        {
            throw new ArgumentException($"Pkm version ids cannot be empty");
        }

        DataActionPayload act(string pkmId)
        {
            var pkmDto = loaders.pkmLoader.GetDto(pkmId);
            var oldSaveId = pkmDto!.SaveId;
            if (oldSaveId != null)
            {
                loaders.pkmLoader.WriteEntity(pkmDto.PkmEntity with { SaveId = default });
            }

            var pkmNickname = loaders.pkmVersionLoader.GetDto(pkmId)?.Nickname;
            var saveExists = loaders.saveLoadersDict.TryGetValue(oldSaveId ?? 0, out var saveLoaders);

            return new(
                type: DataActionType.DETACH_PKM_SAVE,
                parameters: [saveExists ? saveLoaders.Save.Version : null, pkmNickname]
            );
        }

        List<DataActionPayload> payloads = [];
        foreach (var pkmId in pkmIds)
        {
            payloads.Add(act(pkmId));
        }

        return payloads[0];
    }
}
