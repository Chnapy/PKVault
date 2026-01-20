public class EditPkmSaveAction(
    ActionService actionService, PkmConvertService pkmConvertService,
    Dictionary<ushort, StaticEvolve> Evolves,
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

        var availableMoves = await actionService.GetPkmAvailableMoves(saveId, pkmSaveId);

        var pkm = pkmSave!.Pkm.Update(pkm =>
        {
            EditPkmVersionAction.EditPkmNickname(pkmConvertService, pkm, editPayload.Nickname);
            EditPkmVersionAction.EditPkmEVs(pkmConvertService, pkm, editPayload.EVs);
            EditPkmVersionAction.EditPkmMoves(pkmConvertService, pkm, availableMoves, editPayload.Moves);

            // absolutly required before each write
            // TODO make a using write pkm to ensure use of this call
            pkm.ResetPartyStats();
            pkm.RefreshChecksum();
        });

        saveLoaders.Pkms.WriteDto(pkmSave with { Pkm = pkm });

        var pkmVersion = loaders.pkmVersionLoader.GetEntityBySave(pkmSave.SaveId, pkmSave.IdBase);
        if (pkmVersion != null)
        {
            await SynchronizePkmAction.SynchronizeSaveToPkmVersion(pkmConvertService, loaders, flags, Evolves, [(pkmVersion.Id, pkmSave.IdBase)]);
        }

        return new(
            type: DataActionType.EDIT_PKM_SAVE,
            parameters: [saveLoaders.Save.Version, pkmSave.Nickname]
        );
    }
}
