
public record DetachPkmSaveActionInput(string[] pkmVersionIds);

public class DetachPkmSaveAction(
    IPkmVersionLoader pkmVersionLoader, ISavesLoadersService savesLoadersService
) : DataAction<DetachPkmSaveActionInput>
{
    protected override async Task<DataActionPayload> Execute(DetachPkmSaveActionInput input, DataUpdateFlags flags)
    {
        if (input.pkmVersionIds.Length == 0)
        {
            throw new ArgumentException($"Pkm version ids cannot be empty");
        }

        async Task<DataActionPayload> act(string pkmVersionId)
        {
            var pkmVersionEntity = await pkmVersionLoader.GetEntity(pkmVersionId);
            var oldSaveId = pkmVersionEntity!.AttachedSaveId;
            if (oldSaveId != null)
            {
                pkmVersionEntity.AttachedSaveId = null;
                pkmVersionEntity.AttachedSavePkmIdBase = null;
                await pkmVersionLoader.UpdateEntity(pkmVersionEntity);
            }

            var pkm = await pkmVersionLoader.GetPKM(pkmVersionEntity);

            var pkmNickname = pkm.Nickname;
            var saveLoaders = savesLoadersService.GetLoaders(oldSaveId ?? 0);

            return new(
                type: DataActionType.DETACH_PKM_SAVE,
                parameters: [saveLoaders?.Save.Version, pkmNickname]
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
