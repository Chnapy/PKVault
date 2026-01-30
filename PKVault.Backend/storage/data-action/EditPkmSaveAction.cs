public record EditPkmSaveActionInput(uint saveId, string pkmSaveId, EditPkmVersionPayload editPayload);

public class EditPkmSaveAction(
    ActionService actionService, PkmConvertService pkmConvertService,
    SynchronizePkmAction synchronizePkmAction,
    IPkmVersionLoader pkmVersionLoader, ISavesLoadersService savesLoadersService
) : DataAction<EditPkmSaveActionInput>
{
    protected override async Task<DataActionPayload> Execute(EditPkmSaveActionInput input, DataUpdateFlags flags)
    {
        var saveLoaders = savesLoadersService.GetLoaders(input.saveId);
        var pkmSave = saveLoaders.Pkms.GetDto(input.pkmSaveId);

        var availableMoves = await actionService.GetPkmAvailableMoves(input.saveId, input.pkmSaveId);

        var pkm = pkmSave!.Pkm.Update(pkm =>
        {
            EditPkmVersionAction.EditPkmNickname(pkmConvertService, pkm, input.editPayload.Nickname);
            EditPkmVersionAction.EditPkmEVs(pkmConvertService, pkm, input.editPayload.EVs);
            EditPkmVersionAction.EditPkmMoves(pkmConvertService, pkm, availableMoves, input.editPayload.Moves);

            // absolutly required before each write
            // TODO make a using write pkm to ensure use of this call
            pkm.ResetPartyStats();
            pkm.RefreshChecksum();
        });

        saveLoaders.Pkms.WriteDto(pkmSave with { Pkm = pkm });

        var pkmVersion = await pkmVersionLoader.GetEntityBySave(pkmSave.SaveId, pkmSave.IdBase);
        if (pkmVersion != null)
        {
            await synchronizePkmAction.SynchronizeSaveToPkmVersion(new([(pkmVersion.Id, pkmSave.IdBase)]));
        }

        return new(
            type: DataActionType.EDIT_PKM_SAVE,
            parameters: [saveLoaders.Save.Version, pkmSave.Nickname]
        );
    }
}
