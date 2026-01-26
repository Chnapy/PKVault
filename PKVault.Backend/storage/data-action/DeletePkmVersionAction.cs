public record DeletePkmVersionActionInput(string[] pkmVersionIds);

public class DeletePkmVersionAction(
    IPkmVersionLoader pkmVersionLoader
) : DataAction<DeletePkmVersionActionInput>
{
    protected override async Task<DataActionPayload> Execute(DeletePkmVersionActionInput input, DataUpdateFlags flags)
    {
        if (input.pkmVersionIds.Length == 0)
        {
            throw new ArgumentException($"Pkm version ids cannot be empty");
        }

        async Task<DataActionPayload> act(string pkmVersionId)
        {
            var pkmVersion = await pkmVersionLoader.GetEntity(pkmVersionId);
            var pkm = await pkmVersionLoader.GetPKM(pkmVersion);

            await pkmVersionLoader.DeleteEntity(pkmVersion);

            if (pkmVersion.IsMain)
            {
                var versions = await pkmVersionLoader.GetEntitiesByBox(pkmVersion.BoxId, pkmVersion.BoxSlot);
                if (versions.Count > 0)
                {
                    var newMainVersion = versions.First().Value;
                    newMainVersion.IsMain = true;
                    await pkmVersionLoader.UpdateEntity(newMainVersion);
                }
            }

            return new(
                type: DataActionType.DELETE_PKM_VERSION,
                parameters: [pkm.Nickname, pkmVersion.Generation]
            );
        }

        List<DataActionPayload> payloads = [];
        foreach (var pkmVersionId in input.pkmVersionIds)
        {
            payloads.Add(await act(pkmVersionId));
        }

        return payloads[0];
    }
}
