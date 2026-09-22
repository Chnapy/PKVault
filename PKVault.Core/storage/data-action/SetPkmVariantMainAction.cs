namespace PKVault.Core;

public record SetPkmVariantMainActionInput(string pkmVariantId);

public class SetPkmVariantMainAction(
    IPkmVariantLoader pkmVariantLoader
) : DataAction<SetPkmVariantMainActionInput>
{
    protected override async Task<DataActionPayload> Execute(SetPkmVariantMainActionInput input, DataUpdateFlags flags)
    {
        var pkmVariant = await pkmVariantLoader.GetEntity(input.pkmVariantId);
        var dto = await pkmVariantLoader.CreateDTO(pkmVariant);

        if (!dto.CanEdit)
            throw new ArgumentException($"PkmVariant cannot be edited: {pkmVariant.Id}");

        PkmVariantEntity[] pkmVariantList = (await pkmVariantLoader.GetEntitiesByBox(pkmVariant.BoxId)).TryGetValue(pkmVariant.BoxSlot, out var dict)
            ? [.. dict.Values]
            : [];
        var mainVariant = pkmVariantList.First(e => e.IsMain);

        if (pkmVariant.IsMain || pkmVariant.Id == mainVariant.Id)
            throw new ArgumentException($"PkmVariant is already main: {pkmVariant.Id}");

        mainVariant.IsMain = false;
        pkmVariant.IsMain = true;

        await pkmVariantLoader.UpdateEntity(mainVariant);
        await pkmVariantLoader.UpdateEntity(pkmVariant);

        return new(
            type: DataActionType.SET_PKM_VERSION_MAIN,
            parameters: [dto.Nickname, dto.Context, dto.Species]
        );
    }
}
