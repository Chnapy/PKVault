
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

        DataActionPayload act(string pkmVersionId)
        {
            var pkmVersionEntity = pkmVersionLoader.GetEntity(pkmVersionId);
            var oldSaveId = pkmVersionEntity!.AttachedSaveId;
            if (oldSaveId != null)
            {
                pkmVersionLoader.WriteEntity(pkmVersionEntity with
                {
                    AttachedSaveId = null,
                    AttachedSavePkmIdBase = null
                });
            }

            var pkm = pkmVersionLoader.GetPkmVersionEntityPkm(pkmVersionEntity);

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
            payloads.Add(act(pkmVersionId));
        }

        return payloads[0];
    }
}
