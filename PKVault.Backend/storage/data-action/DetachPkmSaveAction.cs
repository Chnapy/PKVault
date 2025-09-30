
public class DetachPkmSaveAction(string pkmId) : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var pkm = await loaders.pkmLoader.GetDto(pkmId);
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

        var pkmNickname = (await loaders.pkmVersionLoader.GetDto(pkmId))?.Nickname;
        var saveExists = loaders.saveLoadersDict.TryGetValue(oldSaveId ?? 0, out var saveLoaders);

        return new()
        {
            type = DataActionType.DETACH_PKM_SAVE,
            parameters = [saveExists ? saveLoaders.Save.Version : null, pkmNickname]
        };
    }
}
