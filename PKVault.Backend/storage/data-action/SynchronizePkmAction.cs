public class SynchronizePkmAction(uint saveId, string[] pkmVersionIds) : DataAction
{
    public static string[] GetPkmVersionsToSynchronize(DataEntityLoaders loaders, uint saveId)
    {
        var pkmVersionDtos = loaders.pkmVersionLoader.GetAllDtos();
        var saveLoaders = loaders.saveLoadersDict[saveId];
        var allSavePkms = saveLoaders.Pkms.GetAllDtos();

        return [.. pkmVersionDtos.Select(pkmVersion =>
        {
            var pkmDto = pkmVersion.PkmDto;
            if (pkmDto?.SaveId != saveId)
            {
                return "";
            }

            var savePkms = allSavePkms.FindAll(pkm => pkm.PkmVersionId == pkmVersion.Id);
            if (savePkms.Count != 1)
            {
                return "";
            }

            var savePkm = savePkms[0];

            var needsSynchro = pkmVersion.DynamicChecksum != savePkm.DynamicChecksum;
            if (needsSynchro)
            {
                return pkmVersion.Id;
            }

            return "";
        }).ToList().FindAll(pkmVersionId => pkmVersionId.Length > 0).Distinct()];
    }

    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        if (pkmVersionIds.Length == 0)
        {
            throw new ArgumentException($"Pkm version ids cannot be empty");
        }

        void act(string pkmVersionId)
        {
            var pkmVersionDto = loaders.pkmVersionLoader.GetDto(pkmVersionId);
            var pkmDto = pkmVersionDto!.PkmDto;

            if (pkmDto.SaveId == default)
            {
                throw new ArgumentException($"Cannot synchronize pkm-version detached from save, pkm-version.id={pkmVersionId}");
            }

            var saveLoaders = loaders.saveLoadersDict[saveId];
            var savePkms = saveLoaders.Pkms.GetAllDtos().FindAll(pkm => pkm.PkmVersionId == pkmVersionId);

            if (savePkms.Count == 0)
            {
                Console.WriteLine($"Attached save pkm not found for pkmVersion.Id={pkmVersionId}");
            }

            if (savePkms.Count > 1)
            {
                Console.WriteLine($"Multiple save pkms with same ID for pkmVersion.Id={pkmVersionId}");
            }

            var savePkm = savePkms[0];

            var relatedPkmVersions = loaders.pkmVersionLoader.GetAllDtos().FindAll(value => value.PkmDto.Id == pkmDto.Id);

            relatedPkmVersions.ForEach((version) =>
            {
                var pkm = version.Pkm;

                PkmConvertService.PassAllToPkmSafe(savePkm!.Pkm, pkm);

                loaders.pkmVersionLoader.WriteDto(version);

                flags.MainPkmVersions = true;
            });
        }

        foreach (var pkmVersionId in pkmVersionIds)
        {
            act(pkmVersionId);
        }

        return new()
        {
            type = DataActionType.PKM_SYNCHRONIZE,
            parameters = [saveId, pkmVersionIds.Length]
        };
    }
}
