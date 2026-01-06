using PKHeX.Core;

public class SynchronizePkmAction(
    PkmConvertService pkmConvertService,
    (string PkmId, string? SavePkmId)[] pkmMainAndPkmSaveIds
) : DataAction
{
    public static (string PkmId, string SavePkmId)[] GetPkmsToSynchronize(DataEntityLoaders loaders, uint saveId)
    {
        var pkmVersionDtos = loaders.pkmVersionLoader.GetAllDtos();
        var saveLoaders = loaders.saveLoadersDict[saveId];
        var allSavePkms = saveLoaders.Pkms.GetAllDtos();

        return [.. pkmVersionDtos.Select(pkmVersion =>
        {
            var pkmDto = pkmVersion.PkmDto;
            if (pkmDto?.SaveId != saveId)
            {
                return ("", "");
            }

            if (pkmVersion.Generation != saveLoaders.Save.Generation)
            {
                return ("", "");
            }

            var savePkms = allSavePkms.FindAll(pkm => pkm.PkmVersionId == pkmVersion.Id);

            if (savePkms.Count != 1)
            {
                return ("", "");
            }

            var savePkm = savePkms[0];

            var needsSynchro = pkmVersion.DynamicChecksum != savePkm.DynamicChecksum;
            if (needsSynchro)
            {
                return (pkmVersion.PkmId, savePkm.Id);
            }

            return ("", "");
        }).ToList().FindAll(entry => entry.Item1.Length > 0).Distinct()];
    }

    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        await SynchronizeSaveToPkmVersion(
            pkmConvertService,
            loaders, flags,
            pkmMainAndPkmSaveIds
        );

        var pkmDto = loaders.pkmLoader.GetEntity(pkmMainAndPkmSaveIds[0].PkmId);

        return new()
        {
            type = DataActionType.PKM_SYNCHRONIZE,
            parameters = [pkmDto.SaveId, pkmMainAndPkmSaveIds.Length]
        };
    }

    public static async Task SynchronizeSaveToPkmVersion(
        PkmConvertService pkmConvertService,
        DataEntityLoaders loaders, DataUpdateFlags flags,
        (string PkmId, string? SavePkmId)[] pkmMainAndPkmSaveIds
    )
    {
        if (pkmMainAndPkmSaveIds.Length == 0)
        {
            throw new ArgumentException($"Pkm main & pkm save ids cannot be empty");
        }

        void act(string pkmId, string? savePkmId)
        {
            var pkmDto = loaders.pkmLoader.GetDto(pkmId);
            var pkmVersionDtos = loaders.pkmVersionLoader.GetDtosByPkmId(pkmId).Values.ToList();

            if (pkmDto.SaveId == default)
            {
                throw new ArgumentException($"Cannot synchronize pkm detached from save, pkm.id={pkmId}");
            }

            var saveLoaders = loaders.saveLoadersDict[(uint)pkmDto.SaveId!];
            var pkmVersionDto = pkmVersionDtos.Find(version => version.Generation == saveLoaders.Save.Generation);
            var savePkm = savePkmId == null
                ? saveLoaders.Pkms.GetAllDtos().Find(pkm => pkm.PkmVersionId == pkmVersionDto.Id)
                : saveLoaders.Pkms.GetDto(savePkmId);

            if (savePkm == null)
            {
                Console.WriteLine($"Attached save pkm not found for pkm.Id={pkmId}");
            }

            pkmVersionDtos.ForEach((version) =>
            {
                var versionPkm = version.Pkm;

                // update xp etc,
                // and species/form only when possible

                var saveVersion = PkmVersionDTO.GetSingleVersion(version.Version);
                var versionSave = BlankSaveFile.Get(saveVersion);
                var correctSpeciesForm = versionSave.Personal.IsPresentInGame(savePkm.Pkm.Species, savePkm.Pkm.Form);
                if (correctSpeciesForm && savePkm.Pkm.Species >= versionPkm.Species)
                {
                    versionPkm.Species = savePkm.Pkm.Species;
                    versionPkm.Form = savePkm.Pkm.Form;
                    version.PkmVersionEntity.Filepath = PKMLoader.GetPKMFilepath(versionPkm);
                }

                if (savePkm.Pkm.Language != 0)
                {
                    versionPkm.Language = savePkm.Pkm.Language;
                }

                if (savePkm.PkmVersionId == version.Id)
                {
                    pkmConvertService.PassAllToPkmSafe(savePkm.Pkm, versionPkm);
                }
                else
                {
                    pkmConvertService.PassAllDynamicsNItemToPkm(savePkm.Pkm, versionPkm);
                }

                loaders.pkmVersionLoader.WriteDto(version);

                flags.MainPkmVersions = true;
            });
        }

        foreach (var (pkmId, savePkmId) in pkmMainAndPkmSaveIds)
        {
            act(pkmId, savePkmId);
        }
    }

    public static async Task SynchronizePkmVersionToSave(
        PkmConvertService pkmConvertService,
        DataEntityLoaders loaders, DataUpdateFlags flags,
        (string PkmId, string? SavePkmId)[] pkmMainAndPkmSaveIds
    )
    {
        if (pkmMainAndPkmSaveIds.Length == 0)
        {
            throw new ArgumentException($"Pkm main & pkm save ids cannot be empty");
        }

        void act(string pkmId, string? savePkmId)
        {
            var pkmDto = loaders.pkmLoader.GetDto(pkmId);
            var pkmVersionDtos = loaders.pkmVersionLoader.GetDtosByPkmId(pkmId).Values.ToList();

            if (pkmDto.SaveId == default)
            {
                throw new ArgumentException($"Cannot synchronize pkm detached from save, pkm.id={pkmId}");
            }

            var saveLoaders = loaders.saveLoadersDict[(uint)pkmDto.SaveId!];
            var pkmVersionDto = pkmVersionDtos.Find(version => version.Generation == saveLoaders.Save.Generation);
            var savePkm = savePkmId == null
                ? saveLoaders.Pkms.GetAllDtos().Find(pkm => pkm.PkmVersionId == pkmVersionDto.Id)
                : saveLoaders.Pkms.GetDto(savePkmId);

            if (savePkm == null)
            {
                Console.WriteLine($"Attached save pkm not found for pkm.Id={pkmId}");
            }

            var versionPkm = pkmVersionDto.Pkm;

            // update xp etc,
            // and species/form only when possible

            var correctSpeciesForm = saveLoaders.Save.Personal.IsPresentInGame(versionPkm.Species, versionPkm.Form);
            if (correctSpeciesForm)
            {
                savePkm.Pkm.Species = versionPkm.Species;
                savePkm.Pkm.Form = versionPkm.Form;
            }

            if (saveLoaders.Save.Language != 0)
            {
                versionPkm.Language = saveLoaders.Save.Language;
                loaders.pkmVersionLoader.WriteDto(pkmVersionDto);
            }

            if (savePkm.PkmVersionId == pkmVersionDto.Id)
            {
                pkmConvertService.PassAllToPkmSafe(versionPkm, savePkm.Pkm);
            }
            else
            {
                pkmConvertService.PassAllDynamicsNItemToPkm(versionPkm, savePkm.Pkm);
            }

            saveLoaders.Pkms.WriteDto(savePkm);

            flags.Saves.Add(new()
            {
                SaveId = (uint)pkmDto.SaveId,
                SavePkms = true,
            });
        }

        foreach (var (pkmId, savePkmId) in pkmMainAndPkmSaveIds)
        {
            act(pkmId, savePkmId);
        }
    }
}
