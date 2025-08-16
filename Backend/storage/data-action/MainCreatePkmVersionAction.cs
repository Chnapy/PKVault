
using PKHeX.Core;

public class MainCreatePkmVersionAction : DataAction
{
    private readonly string pkmId;
    private readonly uint generation;

    public MainCreatePkmVersionAction(string _pkmId, uint _generation)
    {
        pkmId = _pkmId;
        generation = _generation;
    }

    public override DataActionPayload GetPayload()
    {
        return new DataActionPayload
        {
            type = DataActionType.MAIN_CREATE_PKM_VERSION,
            parameters = [pkmId, generation]
        };
    }

    public override async Task Execute(DataEntityLoaders loaders)
    {
        Console.WriteLine($"Create PKM version, pkmId={pkmId}, generation={generation}");

        var pkmEntity = loaders.pkmLoader.GetEntity(pkmId);
        if (pkmEntity == default)
        {
            throw new Exception($"Pkm entity not found, id={pkmId}");
        }

        var pkmVersions = loaders.pkmVersionLoader.GetAllEntities().FindAll(pkmVersion => pkmVersion.PkmId == pkmId);

        var pkmVersionEntity = pkmVersions.Find(pkmVersion => pkmVersion.Generation == generation);
        if (pkmVersionEntity != default)
        {
            throw new Exception($"Pkm-version already exists, pkm.id={pkmId} generation={generation}");
        }

        var pkmVersionOrigin = pkmVersions.Find(pkmVersion => pkmVersion.Id == pkmId);
        if (pkmVersionOrigin == default)
        {
            throw new Exception($"Pkm-version original not found, pkm.id={pkmId} generation={generation}");
        }

        var pkmOriginBytes = loaders.pkmFileLoader.GetEntity(pkmVersionOrigin);
        var pkmOrigin = PKMLoader.CreatePKM(pkmOriginBytes, pkmVersionOrigin, pkmEntity);

        var pkmConverted = PkmConvertService.GetConvertedPkm(pkmOrigin, pkmEntity, generation);

        var filepath = loaders.pkmFileLoader.WriteEntity(
            PKMLoader.GetPKMBytes(pkmConverted), pkmConverted, generation, null);

        var pkmVersionCreated = new PkmVersionEntity
        {
            Id = PkmSaveDTO.GetPKMId(pkmConverted, generation),
            PkmId = pkmId,
            Generation = generation,
            Filepath = filepath,
        };

        loaders.pkmVersionLoader.WriteEntity(pkmVersionCreated);
    }
}
