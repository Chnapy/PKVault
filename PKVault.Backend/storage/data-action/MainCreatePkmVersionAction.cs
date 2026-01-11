public class MainCreatePkmVersionAction(
    PkmConvertService pkmConvertService,
    string pkmId, byte generation
) : DataAction
{
    // required to keep same generated PID between memory => file loaders
    // because PID is randomly generated
    private uint? createdPid;

    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        Console.WriteLine($"Create PKM version, pkmId={pkmId}, generation={generation}");

        var pkmDto = loaders.pkmLoader.GetDto(pkmId);
        if (pkmDto == default)
        {
            throw new KeyNotFoundException($"Pkm entity not found, id={pkmId}");
        }

        var pkmVersions = loaders.pkmVersionLoader.GetDtosByPkmId(pkmId).Values.ToList();

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

        var pkmConverted = pkmConvertService.GetConvertedPkm(pkmOrigin, generation, createdPid);
        createdPid = pkmConverted.PID;

        loaders.pkmVersionLoader.WriteEntity(new(
            SchemaVersion: loaders.pkmVersionLoader.GetLastSchemaVersion(),
            Id: pkmConverted.GetPKMIdBase(),
            PkmId: pkmId,
            Generation: generation,
            Filepath: PKMLoader.GetPKMFilepath(pkmConverted)
        ), pkmConverted);

        return new()
        {
            type = DataActionType.MAIN_CREATE_PKM_VERSION,
            parameters = [pkmVersionOrigin.Nickname, generation]
        };
    }
}
