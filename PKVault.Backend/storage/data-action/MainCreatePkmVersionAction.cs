public class MainCreatePkmVersionAction(string pkmId, uint generation) : DataAction
{
    // required to keep same generated PID between memory => file loaders
    // because PID is randomly generated
    private uint? createdPid;

    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        Console.WriteLine($"Create PKM version, pkmId={pkmId}, generation={generation}");

        var pkmDto = await loaders.pkmLoader.GetDto(pkmId);
        if (pkmDto == default)
        {
            throw new KeyNotFoundException($"Pkm entity not found, id={pkmId}");
        }

        var pkmVersions = (await loaders.pkmVersionLoader.GetAllDtos()).FindAll(pkmVersion => pkmVersion.PkmDto.Id == pkmId);

        var pkmVersionEntity = pkmVersions.Find(pkmVersion => pkmVersion.Generation == generation);
        if (pkmVersionEntity != default)
        {
            throw new ArgumentException($"Pkm-version already exists, pkm.id={pkmId} generation={generation}");
        }

        var pkmVersionOrigin = pkmVersions.Find(pkmVersion => pkmVersion.IsMain);
        if (pkmVersionOrigin == default)
        {
            throw new ArgumentException($"Pkm-version original not found, pkm.id={pkmId} generation={generation}");
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

        flags.MainPkmVersions = true;

        return new()
        {
            type = DataActionType.MAIN_CREATE_PKM_VERSION,
            parameters = [pkmVersionOrigin.Nickname, generation]
        };
    }
}
