
public class DetachPkmSaveAction : DataAction
{
    private readonly string pkmId;

    public DetachPkmSaveAction(string _pkmId)
    {
        pkmId = _pkmId;
    }

    public override DataActionPayload GetPayload()
    {
        return new DataActionPayload
        {
            type = DataActionType.DETACH_PKM_SAVE,
            parameters = [pkmId]
        };
    }

    public override async Task Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var pkm = await loaders.pkmLoader.GetDto(pkmId);
        if (pkm.SaveId == null)
        {
            return;
        }
        var oldSaveId = pkm.SaveId;

        pkm.PkmEntity.SaveId = default;
        loaders.pkmLoader.WriteDto(pkm);

        flags.MainPkms = true;
        flags.MainPkmVersions = true;   // when there is warnings

        flags.Saves.Add(new()
        {
            SaveId = (uint)oldSaveId,
            SavePkms = true,
        });
    }
}
