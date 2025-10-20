public class EditPkmSaveAction(uint saveId, string pkmSaveId, EditPkmVersionPayload editPayload) : DataAction
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

        var availableMoves = await StorageService.GetPkmAvailableMoves(saveId, pkmSaveId);

        EditPkmVersionAction.EditPkmNickname(pkm, editPayload.Nickname);
        EditPkmVersionAction.EditPkmEVs(pkm, editPayload.EVs);
        EditPkmVersionAction.EditPkmMoves(pkm, availableMoves, editPayload.Moves);

        // absolutly required before each write
        // TODO make a using write pkm to ensure use of this call
        pkm.RefreshChecksum();

        saveLoaders.Pkms.WriteDto(pkmSave);

        flags.Saves.Add(new()
        {
            SaveId = saveId,
            SavePkms = true,
        });

        return new()
        {
            type = DataActionType.EDIT_PKM_SAVE,
            parameters = [saveLoaders.Save.Version, pkmSave.Nickname]
        };
    }
}
