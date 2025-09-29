public class SaveDeletePkmAction(uint saveId, string pkmId) : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var saveLoaders = loaders.saveLoadersDict[saveId];

        var dto = await saveLoaders.Pkms.GetDto(pkmId);
        if (dto == default)
        {
            throw new KeyNotFoundException("Save Pkm not found");
        }

        await saveLoaders.Pkms.DeleteDto(pkmId);

        flags.Saves.Add(new()
        {
            SaveId = saveId,
            SavePkms = true,
        });
        flags.Dex = true;

        return new()
        {
            type = DataActionType.SAVE_DELETE_PKM,
            parameters = [saveLoaders.Save.Version, dto.Nickname]
        };
    }
}
