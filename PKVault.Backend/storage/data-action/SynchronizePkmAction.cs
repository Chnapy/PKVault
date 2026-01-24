using PKHeX.Core;

public record SynchronizePkmActionInput(
    (string PkmVersionId, string SavePkmIdBase)[] pkmVersionAndPkmSaveIds,
    DataEntityLoaders loaders
);

public class SynchronizePkmAction(
    PkmConvertService pkmConvertService, StaticDataService staticDataService, IPkmVersionLoader pkmVersionLoader
) : DataAction<SynchronizePkmActionInput>
{
    public async Task<SynchronizePkmActionInput[]> GetSavesPkmsToSynchronize(DataEntityLoaders loaders)
    {
        var saveLoaders = loaders.saveLoadersDict;

        if (saveLoaders.Count == 0)
        {
            return [];
        }

        var time = LogUtil.Time($"Check saves to synchronize ({saveLoaders.Count} saves)");

        var pkmVersionDtos = pkmVersionLoader.GetAllEntities();

        var pkmVersionsBySaveId = pkmVersionDtos.Values
            .Where(pv =>
            {
                return pv.AttachedSaveId != null
                && saveLoaders.TryGetValue((uint)pv.AttachedSaveId, out var save);
            })
            .GroupBy(pv => (uint)pv.AttachedSaveId!)
            .ToDictionary(g => g.Key, g => g.ToList());

        SynchronizePkmActionInput[] synchronizationData = await Task.WhenAll(
            saveLoaders.Values.Select(saveLoader => Task.Run(() =>
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

                return new SynchronizePkmActionInput([.. result], loaders);
            }))
        );

        time();

        return synchronizationData;
    }

    protected override async Task<DataActionPayload> Execute(SynchronizePkmActionInput input, DataUpdateFlags flags)
    {
        await SynchronizeSaveToPkmVersion(input);

        var pkmVersionDto = pkmVersionLoader.GetEntity(input.pkmVersionAndPkmSaveIds[0].PkmVersionId);

        return new(
            type: DataActionType.PKM_SYNCHRONIZE,
            parameters: [pkmVersionDto.AttachedSaveId, input.pkmVersionAndPkmSaveIds.Length]
        );
    }

    public async Task SynchronizeSaveToPkmVersion(SynchronizePkmActionInput input)
    {
        if (input.pkmVersionAndPkmSaveIds.Length == 0)
        {
            throw new ArgumentException($"Pkm main & pkm save ids cannot be empty");
        }

        var staticData = await staticDataService.GetStaticData();
        var evolves = staticData.Evolves;

        async Task act(string pkmVersionId, string savePkmIdBase)
        {
            var pkmVersionDto = await pkmVersionLoader.GetDto(pkmVersionId);
            var pkmVersionEntities = pkmVersionLoader.GetEntitiesByBox(pkmVersionDto.BoxId, pkmVersionDto.BoxSlot).Values.ToList();

            if (pkmVersionDto.AttachedSaveId == null)
            {
                throw new ArgumentException($"Cannot synchronize pkm detached from save, pkmVersion.id={pkmVersionId}");
            }

            var saveLoaders = input.loaders.saveLoadersDict[(uint)pkmVersionDto.AttachedSaveId!];
            var savePkms = saveLoaders.Pkms.GetDtosByIdBase(savePkmIdBase);
            if (savePkms.Count != 1)
            {
                throw new InvalidOperationException($"Multiple savePkms found ({savePkms.Count}) for pkmVersion.id={pkmVersionId} savePkmIdBase={savePkmIdBase}");
            }

            var savePkm = savePkms.First().Value;
            pkmVersionEntities.ForEach((version) =>
            {
                var pkm = pkmVersionLoader.GetPkmVersionEntityPkm(version);
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

                    if (pkmVersionLoader.GetEntityBySave(savePkm.SaveId, savePkm.IdBase)?.Id == version.Id)
                    {
                        pkmConvertService.PassAllToPkmSafe(savePkm.Pkm, versionPkm);
                    }
                    else
                    {
                        pkmConvertService.PassAllDynamicsNItemToPkm(savePkm.Pkm, versionPkm);
                    }
                });

                var versionEntity = pkmVersionLoader.GetEntity(version.Id);
                pkmVersionLoader.WriteEntity(
                    versionEntity with { Filepath = pkmVersionLoader.pkmFileLoader.GetPKMFilepath(pkm, evolves) },
                    pkm
                );
            });
        }

        foreach (var (pkmVersionId, savePkmIdBase) in input.pkmVersionAndPkmSaveIds)
        {
            await act(pkmVersionId, savePkmIdBase);
        }
    }

    public async Task SynchronizePkmVersionToSave(SynchronizePkmActionInput input)
    {
        if (input.pkmVersionAndPkmSaveIds.Length == 0)
        {
            throw new ArgumentException($"Pkm main & pkm save ids cannot be empty");
        }

        async Task act(string pkmVersionId, string savePkmIdBase)
        {
            var pkmVersionDto = await pkmVersionLoader.GetDto(pkmVersionId);
            var pkmVersionDtos = pkmVersionLoader.GetEntitiesByBox(pkmVersionDto.BoxId, pkmVersionDto.BoxSlot).Values.ToList();

            if (pkmVersionDto.AttachedSaveId == null)
            {
                throw new ArgumentException($"Cannot synchronize pkm detached from save, pkmVersion.id={pkmVersionId}");
            }

            var saveLoaders = input.loaders.saveLoadersDict[(uint)pkmVersionDto.AttachedSaveId!];
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
                var versionEntity = pkmVersionLoader.GetEntity(pkmVersionDto.Id);
                await pkmVersionLoader.WriteEntity(versionEntity, versionPkm);
            }

            savePkm = savePkm with
            {
                Pkm = savePkm.Pkm.Update(pkm =>
                {
                    if (pkmVersionLoader.GetEntityBySave(savePkm.SaveId, savePkm.IdBase)?.Id == pkmVersionDto.Id)
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

        foreach (var (pkmVersionId, savePkmIdBase) in input.pkmVersionAndPkmSaveIds)
        {
            await act(pkmVersionId, savePkmIdBase);
        }
    }
}
