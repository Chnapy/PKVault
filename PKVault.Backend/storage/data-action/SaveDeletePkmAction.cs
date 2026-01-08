public class SaveDeletePkmAction(uint saveId, string[] pkmIds) : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        if (pkmIds.Length == 0)
        {
            throw new ArgumentException($"Pkm version ids cannot be empty");
        }

        DataActionPayload act(string pkmId)
        {
            var saveLoaders = loaders.saveLoadersDict[saveId];

            var dto = saveLoaders.Pkms.GetDto(pkmId);
            if (dto == default)
            {
                throw new KeyNotFoundException("Save Pkm not found");
            }

            saveLoaders.Pkms.DeleteDto(pkmId);
            saveLoaders.Pkms.FlushParty();

            flags.Dex = true;

            return new()
            {
                type = DataActionType.SAVE_DELETE_PKM,
                parameters = [saveLoaders.Save.Version, dto.Nickname]
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
