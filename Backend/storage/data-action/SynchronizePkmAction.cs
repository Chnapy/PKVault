
using PKHeX.Core;

public class SynchronizePkmAction : DataAction
{
    public uint saveId { get; }
    private readonly string pkmVersionId;

    public SynchronizePkmAction(uint _saveId, string _pkmVersionId)
    {
        saveId = _saveId;
        pkmVersionId = _pkmVersionId;
    }

    public override DataActionPayload GetPayload()
    {
        return new DataActionPayload
        {
            type = DataActionType.PKM_SYNCHRONIZE,
            parameters = [pkmVersionId]
        };
    }

    public override async Task Execute(DataEntityLoaders loaders)
    {
        var pkmVersionEntity = loaders.pkmVersionLoader.GetEntity(pkmVersionId);
        var pkmEntity = loaders.pkmLoader.GetEntity(pkmVersionEntity.PkmId);

        if (pkmEntity.SaveId == default)
        {
            throw new Exception($"Cannot synchronize pkm-version detached from save, pkm-version.id={pkmVersionId}");
        }

        var saveLoaders = loaders.getSaveLoaders(saveId);
        var savePkm = saveLoaders.Pkms.GetEntity(pkmVersionId);

        var relatedPkmVersions = loaders.pkmVersionLoader.GetAllEntities().FindAll(value => value.PkmId == pkmEntity.Id);

        relatedPkmVersions.ForEach(version =>
        {
            var pkmBytes = loaders.pkmFileLoader.GetEntity(version);
            if (pkmBytes == default)
            {
                throw new Exception($"PKM-bytes is null, from entity Id={version.Id} Filepath={version.Filepath}");
            }

            var pkm = PKMLoader.CreatePKM(pkmBytes, version, pkmEntity);
            if (pkm == default)
            {
                throw new Exception($"PKM is null, from entity Id={version.Id} Filepath={version.Filepath} bytes.length={pkmBytes.Length}");
            }

            PkmConvertService.PassDynamicsToPkm(savePkm.Pkm, pkm, pkmEntity, pkmVersionEntity.Generation);
            PkmConvertService.PassHeldItemToPkm(savePkm.Pkm, pkm);

            pkm.RefreshChecksum();

            // var dto = PkmVersionDTO.FromEntity(version, pkm, pkmEntity);

            loaders.pkmFileLoader.WriteEntity(PKMLoader.GetPKMBytes(pkm), pkm, version.Generation, null);
        });
    }
}
