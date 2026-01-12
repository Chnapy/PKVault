using PKHeX.Core;

public class SynchronizePkmAction(
    PkmConvertService pkmConvertService,
    (string PkmId, string? SavePkmId)[] pkmMainAndPkmSaveIds
) : DataAction
{
    public static async Task<(string PkmId, string SavePkmId)[][]> GetSavesPkmsToSynchronize(DataEntityLoaders loaders)
    {
        var saveLoaders = loaders.saveLoadersDict;

        if (saveLoaders.Count == 0)
        {
            return [];
        }

        var time = LogUtil.Time($"Check saves to synchronize ({saveLoaders.Count} saves)");

        var pkmVersionDtos = loaders.pkmVersionLoader.GetAllDtos();

        var pkmVersionsBySaveId = pkmVersionDtos
            .Where(pv => pv.PkmDto.SaveId != null
                && saveLoaders.TryGetValue((uint)pv.PkmDto.SaveId, out var save)
                && save.Save.Generation == pv.Generation)
            .GroupBy(pv => (uint)pv.PkmDto.SaveId!)
            .ToDictionary(g => g.Key, g => g.ToList());

        (string PkmId, string SavePkmId)[][] synchronizationData = await Task.WhenAll(
            saveLoaders.Keys.Select(saveId => Task.Run(async () =>
            {
                pkmVersionsBySaveId.TryGetValue(saveId, out var pkmVersionsBySave);
                return await GetPkmsToSynchronize(
                    loaders,
                    saveId,
                    pkmVersionsBySave ?? []
                );
            }))
        );

        time();

        return synchronizationData;
    }

    private static async Task<(string PkmId, string SavePkmId)[]> GetPkmsToSynchronize(DataEntityLoaders loaders, uint saveId, List<PkmVersionDTO> pkmVersions)
    {
        var saveLoaders = loaders.saveLoadersDict[saveId];
        var allSavePkms = saveLoaders.Pkms.GetAllDtos();

        var savePkmsByVersionId = new Dictionary<string, PkmSaveDTO>(pkmVersions.Count);

        foreach (var savePkm in allSavePkms)
        {
            if (savePkm.IsDuplicate)
            {
                continue;
            }

            var versionId = savePkm.GetPkmVersion(loaders.pkmVersionLoader)?.Id;
            if (versionId != null)
            {
                savePkmsByVersionId[versionId] = savePkm;
            }
        }

        var result = new List<(string PkmId, string SavePkmId)>();

        foreach (var pkmVersion in pkmVersions)
        {
            if (!savePkmsByVersionId.TryGetValue(pkmVersion.Id, out var savePkm))
                continue;

            if (pkmVersion.DynamicChecksum != savePkm.DynamicChecksum)
            {
                result.Add((pkmVersion.PkmId, savePkm.Id));
            }
        }

        return [.. result];
    }

    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        await SynchronizeSaveToPkmVersion(
            pkmConvertService,
            loaders, flags,
            pkmMainAndPkmSaveIds
        );

        var pkmDto = loaders.pkmLoader.GetEntity(pkmMainAndPkmSaveIds[0].PkmId);

        return new(
            type: DataActionType.PKM_SYNCHRONIZE,
            parameters: [pkmDto.SaveId, pkmMainAndPkmSaveIds.Length]
        );
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
                ? saveLoaders.Pkms.GetAllDtos().Find(pkm => pkm.GetPkmVersion(loaders.pkmVersionLoader)?.Id == pkmVersionDto.Id)
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
                versionPkm = versionPkm.Update(versionPkm =>
                {
                    if (correctSpeciesForm && savePkm.Pkm.Species >= versionPkm.Species)
                    {
                        versionPkm.Species = savePkm.Pkm.Species;
                        versionPkm.Form = savePkm.Pkm.Form;
                    }

                    if (savePkm.Pkm.Language != 0)
                    {
                        versionPkm.Language = savePkm.Pkm.Language;
                    }

                    if (savePkm.GetPkmVersion(loaders.pkmVersionLoader)?.Id == version.Id)
                    {
                        pkmConvertService.PassAllToPkmSafe(savePkm.Pkm, versionPkm);
                    }
                    else
                    {
                        pkmConvertService.PassAllDynamicsNItemToPkm(savePkm.Pkm, versionPkm);
                    }
                });

                loaders.pkmVersionLoader.WriteEntity(
                    version.PkmVersionEntity with { Filepath = PKMLoader.GetPKMFilepath(versionPkm) },
                    versionPkm
                );
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
                ? saveLoaders.Pkms.GetAllDtos().Find(pkm => pkm.GetPkmVersion(loaders.pkmVersionLoader)?.Id == pkmVersionDto.Id)
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
                savePkm = savePkm.WithPKM(
                    savePkm.Pkm.Update(pkm =>
                    {
                        pkm.Species = versionPkm.Species;
                        pkm.Form = versionPkm.Form;
                    })
                );
            }

            if (saveLoaders.Save.Language != 0)
            {
                versionPkm = versionPkm.Update(pkm =>
                {
                    pkm.Language = saveLoaders.Save.Language;
                });
                loaders.pkmVersionLoader.WriteEntity(pkmVersionDto.PkmVersionEntity, versionPkm);
            }

            savePkm = savePkm.WithPKM(
                savePkm.Pkm.Update(pkm =>
                {
                    if (savePkm.GetPkmVersion(loaders.pkmVersionLoader)?.Id == pkmVersionDto.Id)
                    {
                        pkmConvertService.PassAllToPkmSafe(versionPkm, pkm);
                    }
                    else
                    {
                        pkmConvertService.PassAllDynamicsNItemToPkm(versionPkm, pkm);
                    }
                })
            );

            saveLoaders.Pkms.WriteDto(savePkm);
        }

        foreach (var (pkmId, savePkmId) in pkmMainAndPkmSaveIds)
        {
            act(pkmId, savePkmId);
        }
    }
}
