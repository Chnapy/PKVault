using PKHeX.Core;

public class SaveDeletePkmAction : DataAction
{
    public uint saveId { get; }
    private readonly string pkmId;

    public SaveDeletePkmAction(uint _saveId, string _pkmId)
    {
        saveId = _saveId;
        pkmId = _pkmId;
    }

    public override DataActionPayload GetPayload()
    {
        return new DataActionPayload
        {
            type = DataActionType.SAVE_DELETE_PKM,
            parameters = [saveId, pkmId]
        };
    }

    public override async Task Execute(DataEntityLoaders loaders)
    {
        var saveLoaders = loaders.saveLoadersDict[saveId];

        var dto = saveLoaders.Pkms.GetDto(pkmId);
        if (dto == default)
        {
            throw new Exception("Save Pkm not found");
        }

        await saveLoaders.Pkms.DeleteDto(pkmId);
    }
}
