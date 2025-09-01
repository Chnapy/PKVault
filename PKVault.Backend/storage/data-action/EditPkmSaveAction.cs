
using PKHeX.Core;

public class EditPkmSaveAction : DataAction
{
    private readonly uint saveId;
    private readonly string pkmSaveId;
    private readonly EditPkmVersionPayload payload;

    public EditPkmSaveAction(uint _saveId, string _pkmSaveId, EditPkmVersionPayload _payload)
    {
        saveId = _saveId;
        pkmSaveId = _pkmSaveId;
        payload = _payload;
    }

    public override DataActionPayload GetPayload()
    {
        return new DataActionPayload
        {
            type = DataActionType.EDIT_PKM_SAVE,
            parameters = [saveId, pkmSaveId]
        };
    }

    public override async Task Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var saveLoaders = loaders.saveLoadersDict[saveId];
        var pkmSave = await saveLoaders.Pkms.GetDto(pkmSaveId);

        if (pkmSave.PkmVersionId != default)
        {
            throw new Exception("Edit not possible for pkm attached with save");
        }

        var pkm = pkmSave.Pkm;

        EditPkmVersionAction.EditPkmNickname(pkm, payload.Nickname);
        EditPkmVersionAction.EditPkmEVs(pkm, payload.EVs);
        EditPkmVersionAction.EditPkmMoves(pkm, pkmSave.AvailableMoves, payload.Moves);

        // absolutly required before each write
        // TODO make a using write pkm to ensure use of this call
        pkm.RefreshChecksum();

        await saveLoaders.Pkms.WriteDto(pkmSave);

        flags.Saves.Add(new()
        {
            SaveId = saveId,
            SavePkms = true,
        });
    }
}
