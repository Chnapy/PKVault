public record DeletePkmVariantActionInput(string[] pkmVariantIds, bool deleteAllRelatedVariants);

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
            var defaultPkmVariant = await pkmVariantLoader.GetEntity(pkmVariantId);
            PkmVariantEntity[] pkmVariantList = input.deleteAllRelatedVariants
                ? (await pkmVariantLoader.GetEntitiesByBox(defaultPkmVariant.BoxId)).TryGetValue(defaultPkmVariant.BoxSlot, out var dict) ? [.. dict.Values] : []
                : [defaultPkmVariant];

            var cannotDeleteIds = (await Task.WhenAll(pkmVariantList.Select(pkmVariantLoader.CreateDTO)))
                .Where(variant => !variant.CanDelete)
                .Select(variant => variant.Id);

            if (cannotDeleteIds.Any())
            {
                throw new ArgumentException($"PkmVariants cannot be released: {string.Join(',', cannotDeleteIds)}");
            }

            var defaultPkm = await pkmVariantLoader.GetPKM(defaultPkmVariant);

            foreach (var variant in pkmVariantList)
            {
                var pkm = await pkmVariantLoader.GetPKM(variant);

                await pkmVariantLoader.DeleteEntity(variant);

                if (variant.IsMain)
                {
                    var versions = await pkmVariantLoader.GetEntitiesByBox(variant.BoxId, variant.BoxSlot);
                    if (versions.Count > 0)
                    {
                        var newMainVersion = versions.First().Value;
                        newMainVersion.IsMain = true;
                        await pkmVariantLoader.UpdateEntity(newMainVersion);
                    }
                }
            }

            return new(
                type: DataActionType.DELETE_PKM_VERSION,
                parameters: [defaultPkm.Nickname, defaultPkmVariant.Context, defaultPkm.Species]
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
