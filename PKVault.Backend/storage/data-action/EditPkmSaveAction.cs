public class EditPkmSaveAction(
    ActionService actionService, PkmConvertService pkmConvertService,
    uint saveId, string pkmSaveId, EditPkmVersionPayload editPayload
) : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var saveLoaders = loaders.saveLoadersDict[saveId];
        var pkmSave = saveLoaders.Pkms.GetDto(pkmSaveId);

        // if (pkmSave.PkmVersionId != default)
        // {
        //     throw new Exception("Edit not possible for pkm attached with save");
        // }

        var pkm = pkmSave!.Pkm;

        var availableMoves = await actionService.GetPkmAvailableMoves(saveId, pkmSaveId);

        EditPkmVersionAction.EditPkmNickname(pkmConvertService, pkm, editPayload.Nickname);
        EditPkmVersionAction.EditPkmEVs(pkmConvertService, pkm, editPayload.EVs);
        EditPkmVersionAction.EditPkmMoves(pkmConvertService, pkm, availableMoves, editPayload.Moves);

        // absolutly required before each write
        // TODO make a using write pkm to ensure use of this call
        pkm.ResetPartyStats();
        pkm.RefreshChecksum();

        saveLoaders.Pkms.WriteDto(pkmSave);

        flags.Saves.Add(new()
        {
            SaveId = saveId,
            SavePkms = true,
        });

        var pkmVersion = pkmSave.GetPkmVersion(loaders.pkmVersionLoader);
        if (pkmVersion != null)
        {
            await SynchronizePkmAction.SynchronizeSaveToPkmVersion(pkmConvertService, loaders, flags, [(pkmVersion.PkmId, pkmSave.Id)]);
        }

        return new()
        {
            type = DataActionType.EDIT_PKM_SAVE,
            parameters = [saveLoaders.Save.Version, pkmSave.Nickname]
        };
    }
}
