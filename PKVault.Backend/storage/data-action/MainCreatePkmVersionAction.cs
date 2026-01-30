public class MainCreatePkmVersionActionInput(string pkmVersionId, byte generation)
{
    public string PkmVersionId => pkmVersionId;
    public byte Generation => generation;

    // required to keep same generated PKM between memory => file loaders
    // because PID, stats etc are randomly generated
    public ImmutablePKM? CreatedPKM = null;
}

public class MainCreatePkmVersionAction(
    PkmConvertService pkmConvertService, StaticDataService staticDataService,
    IPkmVersionLoader pkmVersionLoader
) : DataAction<MainCreatePkmVersionActionInput>
{
    protected override async Task<DataActionPayload> Execute(MainCreatePkmVersionActionInput input, DataUpdateFlags flags)
    {
        Console.WriteLine($"Create PKM version, pkmVersionId={input.PkmVersionId}, generation={input.Generation}");

        var pkmVersionOrigin = await pkmVersionLoader.GetEntity(input.PkmVersionId);
        if (pkmVersionOrigin == default)
        {
            throw new ArgumentException($"Pkm-version original not found, pkmVersion.id={input.PkmVersionId} generation={input.Generation}");
        }

        if (!pkmVersionOrigin.IsMain)
        {
            throw new ArgumentException($"Pkm-version should have IsMain=true, pkmVersion.id={input.PkmVersionId} generation={input.Generation}");
        }

        var pkmVersions = (await pkmVersionLoader.GetEntitiesByBox(pkmVersionOrigin.BoxId, pkmVersionOrigin.BoxSlot)).Values.ToList();

        var pkmVersionEntity = pkmVersions.Find(pkmVersion => pkmVersion.Generation == input.Generation);
        if (pkmVersionEntity != default)
        {
            throw new ArgumentException($"Pkm-version already exists, pkmVersion.id={pkmVersionEntity.Id} generation={input.Generation}");
        }

        var staticData = await staticDataService.GetStaticData();

        var pkmOrigin = await pkmVersionLoader.GetPKM(pkmVersionOrigin);

        var pkmConverted = input.CreatedPKM ?? pkmConvertService.GetConvertedPkm(pkmOrigin, input.Generation);
        input.CreatedPKM = pkmConverted;

        await pkmVersionLoader.AddEntity(new(
            BoxId: pkmVersionOrigin.BoxId,
            BoxSlot: pkmVersionOrigin.BoxSlot,
            IsMain: false,
            AttachedSaveId: null,
            AttachedSavePkmIdBase: null,
            Generation: input.Generation,
            Pkm: pkmConverted
        ));

        return new(
            type: DataActionType.MAIN_CREATE_PKM_VERSION,
            parameters: [pkmOrigin.Nickname, input.Generation]
        );
    }
}
