public record SaveDeletePkmActionInput(uint saveId, string[] pkmIds);

public class SaveDeletePkmAction(
    ISavesLoadersService savesLoadersService
) : DataAction<SaveDeletePkmActionInput>
{
    protected override async Task<DataActionPayload> Execute(SaveDeletePkmActionInput input, DataUpdateFlags flags)
    {
        if (input.pkmIds.Length == 0)
        {
            throw new ArgumentException($"Pkm version ids cannot be empty");
        }

        DataActionPayload act(string pkmId)
        {
            var saveLoaders = savesLoadersService.GetLoaders(input.saveId);

            var dto = saveLoaders.Pkms.GetDto(pkmId);
            if (dto == default)
            {
                throw new KeyNotFoundException("Save Pkm not found");
            }

            saveLoaders.Pkms.DeleteDto(pkmId);
            saveLoaders.Pkms.FlushParty();

            return new(
                type: DataActionType.SAVE_DELETE_PKM,
                parameters: [saveLoaders.Save.Version, dto.Nickname]
            );
        }

        List<DataActionPayload> payloads = [];
        foreach (var pkmId in input.pkmIds)
        {
            payloads.Add(act(pkmId));
        }

        return payloads[0];
    }
}
