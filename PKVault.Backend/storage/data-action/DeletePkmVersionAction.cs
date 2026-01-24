public record DeletePkmVersionActionInput(string[] pkmVersionIds);

public class DeletePkmVersionAction(
    IPkmVersionLoader pkmVersionLoader
) : DataAction<DeletePkmVersionActionInput>
{
    protected override async Task<DataActionPayload?> Execute(DeletePkmVersionActionInput input, DataUpdateFlags flags)
    {
        if (input.pkmVersionIds.Length == 0)
        {
            throw new ArgumentException($"Pkm version ids cannot be empty");
        }

        async Task<DataActionPayload> act(string pkmVersionId)
        {
            var pkmVersion = await pkmVersionLoader.GetDto(pkmVersionId);

            pkmVersionLoader.DeleteEntity(pkmVersionId);

            if (pkmVersion.IsMain)
            {
                var versions = pkmVersionLoader.GetEntitiesByBox(pkmVersion.BoxId, pkmVersion.BoxSlot);
                if (versions.Count > 0)
                {
                    var newMainVersion = versions.First().Value;
                    pkmVersionLoader.WriteEntity(newMainVersion with { IsMain = true });
                }
            }

            return new(
                type: DataActionType.DELETE_PKM_VERSION,
                parameters: [pkmVersion.Nickname, pkmVersion.Generation]
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
