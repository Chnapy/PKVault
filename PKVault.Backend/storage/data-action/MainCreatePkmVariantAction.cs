public class MainCreatePkmVariantActionInput(string pkmVariantId, byte generation)
{
    public string PkmVariantId => pkmVariantId;
    public byte Generation => generation;

    // required to keep same generated PKM between memory => file loaders
    // because PID, stats etc are randomly generated
    public ImmutablePKM? CreatedPKM = null;
}

public class MainCreatePkmVariantAction(
    IPkmConvertService pkmConvertService, StaticDataService staticDataService,
    IPkmVariantLoader pkmVariantLoader
) : DataAction<MainCreatePkmVariantActionInput>
{
    protected override async Task<DataActionPayload> Execute(MainCreatePkmVariantActionInput input, DataUpdateFlags flags)
    {
        Console.WriteLine($"Create PKM version, pkmVariantId={input.PkmVariantId}, generation={input.Generation}");

        var pkmVariantOrigin = await pkmVariantLoader.GetEntity(input.PkmVariantId);
        if (pkmVariantOrigin == default)
        {
            throw new ArgumentException($"Pkm-version original not found, pkmVariant.id={input.PkmVariantId} generation={input.Generation}");
        }

        var dto = await pkmVariantLoader.CreateDTO(pkmVariantOrigin);

        if (!dto.CanCreateVariant)
        {
            throw new ArgumentException($"PkmVersion cannot create new variant: pkmVariant.id={input.PkmVariantId} generation={input.Generation}");
        }

        var pkmVariants = (await pkmVariantLoader.GetEntitiesByBox(pkmVariantOrigin.BoxId, pkmVariantOrigin.BoxSlot)).Values.ToList();

        var pkmVariantEntity = pkmVariants.Find(pkmVariant => pkmVariant.Generation == input.Generation);
        if (pkmVariantEntity != default)
        {
            throw new ArgumentException($"Pkm-version already exists, pkmVariant.id={pkmVariantEntity.Id} generation={input.Generation}");
        }

        var staticData = await staticDataService.GetStaticData();

        var pkmOrigin = await pkmVariantLoader.GetPKM(pkmVariantOrigin);

        var pkmConverted = input.CreatedPKM ?? pkmConvertService.ConvertTo(pkmOrigin, input.Generation);
        input.CreatedPKM = pkmConverted;

        await pkmVariantLoader.AddEntity(new(
            BoxId: pkmVariantOrigin.BoxId,
            BoxSlot: pkmVariantOrigin.BoxSlot,
            IsMain: false,
            IsExternal: false,
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
