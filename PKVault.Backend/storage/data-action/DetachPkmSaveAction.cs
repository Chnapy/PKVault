
public record DetachPkmSaveActionInput(string[] pkmVariantIds);

public class DetachPkmSaveAction(
    IPkmVariantLoader pkmVariantLoader, ISavesLoadersService savesLoadersService
) : DataAction<DetachPkmSaveActionInput>
{
    protected override async Task<DataActionPayload> Execute(DetachPkmSaveActionInput input, DataUpdateFlags flags)
    {
        if (input.pkmVariantIds.Length == 0)
        {
            throw new ArgumentException($"Pkm version ids cannot be empty");
        }

        async Task<DataActionPayload> act(string pkmVariantId)
        {
            var pkmVariantEntity = await pkmVariantLoader.GetEntity(pkmVariantId);
            var oldSaveId = pkmVariantEntity!.AttachedSaveId;
            if (oldSaveId != null)
            {
                pkmVariantEntity.AttachedSaveId = null;
                pkmVariantEntity.AttachedSavePkmIdBase = null;
                await pkmVariantLoader.UpdateEntity(pkmVariantEntity);
            }

            var pkm = await pkmVariantLoader.GetPKM(pkmVariantEntity);

            var pkmNickname = pkm.Nickname;
            var saveLoaders = savesLoadersService.GetLoaders(oldSaveId ?? 0);

            return new(
                type: DataActionType.DETACH_PKM_SAVE,
                parameters: [saveLoaders?.Save.Version, pkmNickname]
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
