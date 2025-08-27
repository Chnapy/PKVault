
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
        var pkmVersionDto = loaders.pkmVersionLoader.GetDto(pkmVersionId);
        var pkmDto = pkmVersionDto.PkmDto;

        if (pkmDto.SaveId == default)
        {
            throw new Exception($"Cannot synchronize pkm-version detached from save, pkm-version.id={pkmVersionId}");
        }

        var saveLoaders = loaders.saveLoadersDict[saveId];
        var savePkm = saveLoaders.Pkms.GetDto(pkmVersionId);

        var relatedPkmVersions = loaders.pkmVersionLoader.GetAllDtos().FindAll(value => value.PkmDto.Id == pkmDto.Id);

        await Task.WhenAll(
            relatedPkmVersions.Select(async (version) =>
            {
                var pkm = version.Pkm;

                PkmConvertService.PassDynamicsToPkm(savePkm.Pkm, pkm);
                PkmConvertService.PassHeldItemToPkm(savePkm.Pkm, pkm);

                pkm.RefreshChecksum();

                await loaders.pkmVersionLoader.WriteDto(version);
            })
        );
    }
}
