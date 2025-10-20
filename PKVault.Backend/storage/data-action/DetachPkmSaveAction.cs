
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
            var pkm = loaders.pkmLoader.GetDto(pkmId);
            var oldSaveId = pkm!.SaveId;
            if (oldSaveId != null)
            {
                pkm.PkmEntity.SaveId = default;
                loaders.pkmLoader.WriteDto(pkm);

                flags.MainPkms = true;
                flags.MainPkmVersions = true;   // when there is warnings

                flags.Saves.Add(new()
                {
                    SaveId = (uint)oldSaveId,
                    SavePkms = true,
                });
            }

            var pkmNickname = loaders.pkmVersionLoader.GetDto(pkmId)?.Nickname;
            var saveExists = loaders.saveLoadersDict.TryGetValue(oldSaveId ?? 0, out var saveLoaders);

            return new()
            {
                type = DataActionType.DETACH_PKM_SAVE,
                parameters = [saveExists ? saveLoaders.Save.Version : null, pkmNickname]
            };
        }

        List<DataActionPayload> payloads = [];
        foreach (var pkmId in pkmIds)
        {
            payloads.Add(act(pkmId));
        }

        return payloads[0];
    }
}
