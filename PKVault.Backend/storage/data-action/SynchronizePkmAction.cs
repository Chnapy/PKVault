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
        var savePkm = await saveLoaders.Pkms.GetDto(pkmVersionId);

        var relatedPkmVersions = (await loaders.pkmVersionLoader.GetAllDtos()).FindAll(value => value.PkmDto.Id == pkmDto.Id);

        relatedPkmVersions.ForEach((version) =>
        {
            var pkm = version.Pkm;

            PkmConvertService.PassAllToPkm(savePkm!.Pkm, pkm);

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
