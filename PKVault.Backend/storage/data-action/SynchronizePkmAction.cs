public class SynchronizePkmAction(uint saveId, string pkmVersionId) : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var pkmVersionDto = await loaders.pkmVersionLoader.GetDto(pkmVersionId);
        var pkmDto = pkmVersionDto!.PkmDto;

        if (pkmDto.SaveId == default)
        {
            throw new ArgumentException($"Cannot synchronize pkm-version detached from save, pkm-version.id={pkmVersionId}");
        }

        var saveLoaders = loaders.saveLoadersDict[saveId];
        var savePkms = (await saveLoaders.Pkms.GetAllDtos()).FindAll(pkm => pkm.PkmVersionId == pkmVersionId);

        if (savePkms.Count == 0)
        {
            Console.WriteLine($"Attached save pkm not found for pkmVersion.Id={pkmVersionId}");
        }

        if (savePkms.Count > 1)
        {
            Console.WriteLine($"Multiple save pkms with same ID for pkmVersion.Id={pkmVersionId}");
        }

        var savePkm = savePkms[0];

        var relatedPkmVersions = (await loaders.pkmVersionLoader.GetAllDtos()).FindAll(value => value.PkmDto.Id == pkmDto.Id);

        relatedPkmVersions.ForEach((version) =>
        {
            var pkm = version.Pkm;

            PkmConvertService.PassAllToPkmSafe(savePkm!.Pkm, pkm);

            loaders.pkmVersionLoader.WriteDto(version);

            flags.MainPkmVersions = true;
        });

        return new()
        {
            type = DataActionType.PKM_SYNCHRONIZE,
            parameters = [pkmVersionDto.Nickname]
        };
    }
}
