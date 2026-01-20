using PKHeX.Core;

public class SynchronizePkmAction(
    PkmConvertService pkmConvertService,
    Dictionary<ushort, StaticEvolve> Evolves,
    (string PkmVersionId, string SavePkmIdBase)[] pkmVersionAndPkmSaveIds
) : DataAction
{
    public static async Task<(string PkmVersionId, string SavePkmIdBase)[][]> GetSavesPkmsToSynchronize(DataEntityLoaders loaders)
    {
        var saveLoaders = loaders.saveLoadersDict;

        if (saveLoaders.Count == 0)
        {
            return [];
        }

        var time = LogUtil.Time($"Check saves to synchronize ({saveLoaders.Count} saves)");

        var pkmVersionDtos = loaders.pkmVersionLoader.GetAllEntities();

        var pkmVersionsBySaveId = pkmVersionDtos.Values
            .Where(pv =>
            {
                return pv.AttachedSaveId != null
                && saveLoaders.TryGetValue((uint)pv.AttachedSaveId, out var save);
            })
            .GroupBy(pv => (uint)pv.AttachedSaveId!)
            .ToDictionary(g => g.Key, g => g.ToList());

        (string PkmVersionId, string SavePkmIdBase)[][] synchronizationData = await Task.WhenAll(
            saveLoaders.Values.Select(saveLoader => Task.Run<(string PkmVersionId, string SavePkmIdBase)[]>(() =>
            {
                pkmVersionsBySaveId.TryGetValue(saveLoader.Save.Id, out var pkmVersionsBySave);

                var result = new List<(string PkmVersionId, string SavePkmIdBase)>();

                (pkmVersionsBySave ?? []).ForEach(pkmVersion =>
                {
                    if (pkmVersion.AttachedSavePkmIdBase != null)
                    {
                        result.Add((pkmVersion.Id, pkmVersion.AttachedSavePkmIdBase));
                    }
                });

                return [.. result];
            }))
        );

        time();

        return synchronizationData;
    }

    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        await SynchronizeSaveToPkmVersion(
            pkmConvertService,
            loaders, flags,
            Evolves,
            pkmVersionAndPkmSaveIds
        );

        var pkmVersionDto = loaders.pkmVersionLoader.GetEntity(pkmVersionAndPkmSaveIds[0].PkmVersionId);

        return new(
            type: DataActionType.PKM_SYNCHRONIZE,
            parameters: [pkmVersionDto.AttachedSaveId, pkmVersionAndPkmSaveIds.Length]
        );
    }

    public static async Task SynchronizeSaveToPkmVersion(
        PkmConvertService pkmConvertService,
        DataEntityLoaders loaders, DataUpdateFlags flags,
        Dictionary<ushort, StaticEvolve> Evolves,
        (string PkmVersionId, string SavePkmIdBase)[] pkmVersionAndPkmSaveIds
    )
    {
        if (pkmVersionAndPkmSaveIds.Length == 0)
        {
            throw new ArgumentException($"Pkm main & pkm save ids cannot be empty");
        }

        void act(string pkmVersionId, string savePkmIdBase)
        {
            var pkmVersionDto = loaders.pkmVersionLoader.GetDto(pkmVersionId);
            var pkmVersionEntities = loaders.pkmVersionLoader.GetEntitiesByBox(pkmVersionDto.BoxId, pkmVersionDto.BoxSlot).Values.ToList();

            if (pkmVersionDto.AttachedSaveId == null)
            {
                throw new ArgumentException($"Cannot synchronize pkm detached from save, pkmVersion.id={pkmVersionId}");
            }

            var saveLoaders = loaders.saveLoadersDict[(uint)pkmVersionDto.AttachedSaveId!];
            var savePkms = saveLoaders.Pkms.GetDtosByIdBase(savePkmIdBase);
            if (savePkms.Count != 1)
            {
                throw new InvalidOperationException($"Multiple savePkms found ({savePkms.Count}) for pkmVersion.id={pkmVersionId} savePkmIdBase={savePkmIdBase}");
            }

            var savePkm = savePkms.First().Value;
            pkmVersionEntities.ForEach((version) =>
            {
                var pkm = loaders.pkmVersionLoader.GetPkmVersionEntityPkm(version);
                if (!pkm.IsEnabled)
                {
                    return;
                }

                // update xp etc,
                // and species/form only when possible

                var saveVersion = StaticDataService.GetSingleVersion(pkm.Version);
                var versionSave = BlankSaveFile.Get(saveVersion);
                var correctSpeciesForm = versionSave.Personal.IsPresentInGame(savePkm.Pkm.Species, savePkm.Pkm.Form);
                pkm = pkm.Update(versionPkm =>
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

                    if (loaders.pkmVersionLoader.GetEntityBySave(savePkm.SaveId, savePkm.IdBase)?.Id == version.Id)
                    {
                        pkmConvertService.PassAllToPkmSafe(savePkm.Pkm, versionPkm);
                    }
                    else
                    {
                        pkmConvertService.PassAllDynamicsNItemToPkm(savePkm.Pkm, versionPkm);
                    }
                });

                var versionEntity = loaders.pkmVersionLoader.GetEntity(version.Id);
                loaders.pkmVersionLoader.WriteEntity(
                    versionEntity with { Filepath = loaders.pkmVersionLoader.pkmFileLoader.GetPKMFilepath(pkm, Evolves) },
                    pkm
                );
            });
        }

        foreach (var (pkmVersionId, savePkmIdBase) in pkmVersionAndPkmSaveIds)
        {
            act(pkmVersionId, savePkmIdBase);
        }
    }

    public static async Task SynchronizePkmVersionToSave(
        PkmConvertService pkmConvertService,
        DataEntityLoaders loaders, DataUpdateFlags flags,
        (string PkmVersionId, string SavePkmIdBase)[] pkmVersionAndPkmSaveIds
    )
    {
        if (pkmVersionAndPkmSaveIds.Length == 0)
        {
            throw new ArgumentException($"Pkm main & pkm save ids cannot be empty");
        }

        void act(string pkmVersionId, string savePkmIdBase)
        {
            var pkmVersionDto = loaders.pkmVersionLoader.GetDto(pkmVersionId);
            var pkmVersionDtos = loaders.pkmVersionLoader.GetEntitiesByBox(pkmVersionDto.BoxId, pkmVersionDto.BoxSlot).Values.ToList();

            if (pkmVersionDto.AttachedSaveId == null)
            {
                throw new ArgumentException($"Cannot synchronize pkm detached from save, pkmVersion.id={pkmVersionId}");
            }

            var saveLoaders = loaders.saveLoadersDict[(uint)pkmVersionDto.AttachedSaveId!];
            var savePkms = saveLoaders.Pkms.GetDtosByIdBase(savePkmIdBase);
            if (savePkms.Count != 1)
            {
                throw new InvalidOperationException($"Multiple savePkms found ({savePkms.Count}) for pkmVersion.id={pkmVersionId} savePkmIdBase={savePkmIdBase}");
            }

            var savePkm = savePkms.First().Value;
            if (savePkm == null)
            {
                Console.WriteLine($"Attached save pkm not found for pkmVersion.Id={pkmVersionId}");
            }

            var versionPkm = pkmVersionDto.Pkm;

            // update xp etc,
            // and species/form only when possible

            var correctSpeciesForm = saveLoaders.Save.Personal.IsPresentInGame(versionPkm.Species, versionPkm.Form);
            if (correctSpeciesForm)
            {
                savePkm = savePkm with
                {
                    Pkm = savePkm.Pkm.Update(pkm =>
                    {
                        pkm.Species = versionPkm.Species;
                        pkm.Form = versionPkm.Form;
                    })
                };
            }

            if (saveLoaders.Save.Language != 0)
            {
                versionPkm = versionPkm.Update(pkm =>
                {
                    pkm.Language = saveLoaders.Save.Language;
                });
                var versionEntity = loaders.pkmVersionLoader.GetEntity(pkmVersionDto.Id);
                loaders.pkmVersionLoader.WriteEntity(versionEntity, versionPkm);
            }

            savePkm = savePkm with
            {
                Pkm = savePkm.Pkm.Update(pkm =>
                {
                    if (loaders.pkmVersionLoader.GetEntityBySave(savePkm.SaveId, savePkm.IdBase)?.Id == pkmVersionDto.Id)
                    {
                        pkmConvertService.PassAllToPkmSafe(versionPkm, pkm);
                    }
                    else
                    {
                        pkmConvertService.PassAllDynamicsNItemToPkm(versionPkm, pkm);
                    }
                })
            };

            saveLoaders.Pkms.WriteDto(savePkm);
        }

        foreach (var (pkmVersionId, savePkmIdBase) in pkmVersionAndPkmSaveIds)
        {
            act(pkmVersionId, savePkmIdBase);
        }
    }
}
