public record EditPkmSaveActionInput(uint saveId, string pkmSaveId, EditPkmVariantPayload editPayload);

public class EditPkmSaveAction(
    ActionService actionService, PkmConvertService pkmConvertService,
    SynchronizePkmAction synchronizePkmAction,
    IPkmVariantLoader pkmVariantLoader, ISavesLoadersService savesLoadersService
) : DataAction<EditPkmSaveActionInput>
{
    protected override async Task<DataActionPayload> Execute(EditPkmSaveActionInput input, DataUpdateFlags flags)
    {
        var saveLoaders = savesLoadersService.GetLoaders(input.saveId);
        var pkmSave = saveLoaders.Pkms.GetDto(input.pkmSaveId);

        var availableMoves = await actionService.GetPkmAvailableMoves(input.saveId, input.pkmSaveId);

        var pkm = pkmSave!.Pkm.Update(pkm =>
        {
            EditPkmVariantAction.EditPkmNickname(pkmConvertService, pkm, input.editPayload.Nickname);
            EditPkmVariantAction.EditPkmEVs(pkmConvertService, pkm, input.editPayload.EVs);
            EditPkmVariantAction.EditPkmMoves(pkmConvertService, pkm, availableMoves, input.editPayload.Moves);

            // absolutly required before each write
            // TODO make a using write pkm to ensure use of this call
            pkm.ResetPartyStats();
            pkm.RefreshChecksum();
        });

        saveLoaders.Pkms.WriteDto(pkmSave with { Pkm = pkm });

        var pkmVariant = await pkmVariantLoader.GetEntityBySave(pkmSave.SaveId, pkmSave.IdBase);
        if (pkmVariant != null)
        {
            await synchronizePkmAction.SynchronizeSaveToPkmVariant(new([(pkmVariant.Id, pkmSave.IdBase)]));
        }

        return new(
            type: DataActionType.EDIT_PKM_SAVE,
            parameters: [saveLoaders.Save.Version, pkmSave.Nickname]
        );
    }
}
