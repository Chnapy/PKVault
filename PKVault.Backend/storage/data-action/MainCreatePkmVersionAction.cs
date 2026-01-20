public class MainCreatePkmVersionAction(
    PkmConvertService pkmConvertService, Dictionary<ushort, StaticEvolve> evolves,
    string pkmVersionId, byte generation
) : DataAction
{
    // required to keep same generated PID between memory => file loaders
    // because PID is randomly generated
    private uint? createdPid;

    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        Console.WriteLine($"Create PKM version, pkmVersionId={pkmVersionId}, generation={generation}");

        var pkmVersionOrigin = loaders.pkmVersionLoader.GetEntity(pkmVersionId);
        if (pkmVersionOrigin == default)
        {
            throw new ArgumentException($"Pkm-version original not found, pkmVersion.id={pkmVersionId} generation={generation}");
        }

        var pkmVersions = loaders.pkmVersionLoader.GetEntitiesByBox((int)pkmVersionOrigin.BoxId!, (int)pkmVersionOrigin.BoxSlot!).Values.ToList();

        var pkmVersionEntity = pkmVersions.Find(pkmVersion => pkmVersion.Generation == generation);
        if (pkmVersionEntity != default)
        {
            throw new ArgumentException($"Pkm-version already exists, pkmVersion.id={pkmVersionEntity.Id} generation={generation}");
        }

        var pkmOrigin = loaders.pkmVersionLoader.GetPkmVersionEntityPkm(pkmVersionOrigin);

        var pkmConverted = pkmConvertService.GetConvertedPkm(pkmOrigin, generation, createdPid);
        createdPid = pkmConverted.PID;

        loaders.pkmVersionLoader.WriteEntity(new(
            SchemaVersion: loaders.pkmVersionLoader.GetLastSchemaVersion(),
            Id: pkmConverted.GetPKMIdBase(evolves),
            BoxId: pkmVersionOrigin.BoxId,
            BoxSlot: pkmVersionOrigin.BoxSlot,
            IsMain: false,
            AttachedSaveId: null,
            AttachedSavePkmIdBase: null,
            Generation: generation,
            Filepath: loaders.pkmVersionLoader.pkmFileLoader.GetPKMFilepath(pkmConverted, evolves)
        ), pkmConverted);

        return new(
            type: DataActionType.MAIN_CREATE_PKM_VERSION,
            parameters: [pkmOrigin.Nickname, generation]
        );
    }
}
