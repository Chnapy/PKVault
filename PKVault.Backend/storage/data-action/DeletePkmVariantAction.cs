public record DeletePkmVariantActionInput(string[] pkmVariantIds);

public class DeletePkmVariantAction(
    IPkmVariantLoader pkmVariantLoader
) : DataAction<DeletePkmVariantActionInput>
{
    protected override async Task<DataActionPayload> Execute(DeletePkmVariantActionInput input, DataUpdateFlags flags)
    {
        if (input.pkmVariantIds.Length == 0)
        {
            throw new ArgumentException($"Pkm version ids cannot be empty");
        }

        async Task<DataActionPayload> act(string pkmVariantId)
        {
            var pkmVariant = await pkmVariantLoader.GetEntity(pkmVariantId);
            var pkm = await pkmVariantLoader.GetPKM(pkmVariant);

            await pkmVariantLoader.DeleteEntity(pkmVariant);

            if (pkmVariant.IsMain)
            {
                var versions = await pkmVariantLoader.GetEntitiesByBox(pkmVariant.BoxId, pkmVariant.BoxSlot);
                if (versions.Count > 0)
                {
                    var newMainVersion = versions.First().Value;
                    newMainVersion.IsMain = true;
                    await pkmVariantLoader.UpdateEntity(newMainVersion);
                }
            }

            return new(
                type: DataActionType.DELETE_PKM_VERSION,
                parameters: [pkm.Nickname, pkmVariant.Generation]
            );
        }

        List<DataActionPayload> payloads = [];
        foreach (var pkmVariantId in input.pkmVariantIds)
        {
            payloads.Add(await act(pkmVariantId));
        }

        return payloads[0];
    }
}
