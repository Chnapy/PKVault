public class MainCreatePkmVersionAction : DataAction
{
    private readonly string pkmId;
    private readonly uint generation;

    // required to keep same generated PID between memory => file loaders
    // because PID is randomly generated
    private uint? createdPid;

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

        var pkmDto = await loaders.pkmLoader.GetDto(pkmId);
        if (pkmDto == default)
        {
            throw new Exception($"Pkm entity not found, id={pkmId}");
        }

        var pkmVersions = (await loaders.pkmVersionLoader.GetAllDtos()).FindAll(pkmVersion => pkmVersion.PkmDto.Id == pkmId);

        var pkmVersionEntity = pkmVersions.Find(pkmVersion => pkmVersion.Generation == generation);
        if (pkmVersionEntity != default)
        {
            throw new Exception($"Pkm-version already exists, pkm.id={pkmId} generation={generation}");
        }

        var pkmVersionOrigin = pkmVersions.Find(pkmVersion => pkmVersion.IsMain);
        if (pkmVersionOrigin == default)
        {
            throw new Exception($"Pkm-version original not found, pkm.id={pkmId} generation={generation}");
        }

        var pkmOrigin = pkmVersionOrigin.Pkm;

        var pkmConverted = PkmConvertService.GetConvertedPkm(pkmOrigin, generation, createdPid);
        createdPid = pkmConverted.PID;

        var pkmVersionEntityCreated = new PkmVersionEntity
        {
            Id = BasePkmVersionDTO.GetPKMId(pkmConverted),
            PkmId = pkmId,
            Generation = generation,
            Filepath = PKMLoader.GetPKMFilepath(pkmConverted),
        };

        var pkmVersionCreated = await PkmVersionDTO.FromEntity(pkmVersionEntityCreated, pkmConverted, pkmDto);

        loaders.pkmVersionLoader.WriteDto(pkmVersionCreated);
    }
}
