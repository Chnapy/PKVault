using PKHeX.Core;

public record SynchronizePkmActionInput(
    (string PkmVersionId, string SavePkmIdBase)[] pkmVersionAndPkmSaveIds
);

public class SynchronizePkmAction(
    PkmConvertService pkmConvertService,
    IPkmVersionLoader pkmVersionLoader, ISavesLoadersService savesLoadersService
) : DataAction<SynchronizePkmActionInput>
{
    public async Task<SynchronizePkmActionInput[]> GetSavesPkmsToSynchronize()
    {
        var saveLoaders = savesLoadersService.GetAllLoaders();

        if (saveLoaders.Count == 0)
        {
            return [];
        }

        using var _ = LogUtil.Time($"Check saves to synchronize ({saveLoaders.Count} saves)");

        var pkmVersionsBySaveId = await pkmVersionLoader.GetEntitiesAttachedGroupedBySave();

        List<SynchronizePkmActionInput> synchronizationData = [];

        foreach (var saveLoader in saveLoaders)
        {
            pkmVersionsBySaveId.TryGetValue(saveLoader.Save.Id, out var pkmVersionsBySave);

            var result = new List<(string PkmVersionId, string SavePkmIdBase)>();

            foreach (var pkmVersion in pkmVersionsBySave ?? [])
            {
                if (pkmVersion.AttachedSavePkmIdBase != null)
                {
                    var savePkms = saveLoader.Pkms.GetDtosByIdBase(pkmVersion.AttachedSavePkmIdBase);
                    if (savePkms.Count != 1)
                        continue;

                    var savePkm = savePkms.Values.First();
                    var versionPkm = await pkmVersionLoader.GetPKM(pkmVersion);

                    if (versionPkm.DynamicChecksum != savePkm.DynamicChecksum)
                    {
                        result.Add((pkmVersion.Id, pkmVersion.AttachedSavePkmIdBase));
                    }
                }
            }

            if (result.Count > 0)
            {
                synchronizationData.Add(new SynchronizePkmActionInput([.. result]));
            }
        }

        return [.. synchronizationData];
    }

    protected override async Task<DataActionPayload> Execute(SynchronizePkmActionInput input, DataUpdateFlags flags)
    {
        await SynchronizeSaveToPkmVersion(input);

        var pkmVersionDto = await pkmVersionLoader.GetEntity(input.pkmVersionAndPkmSaveIds[0].PkmVersionId);

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

        async Task act(string pkmVersionId, string savePkmIdBase)
        {
            var pkmVersionEntity = await pkmVersionLoader.GetEntity(pkmVersionId);
            var pkmVersionEntities = (await pkmVersionLoader.GetEntitiesByBox(pkmVersionEntity.BoxId, pkmVersionEntity.BoxSlot)).Values.ToList();

            if (pkmVersionEntity.AttachedSaveId == null)
            {
                throw new ArgumentException($"Cannot synchronize pkm detached from save, pkmVersion.id={pkmVersionId}");
            }

            var saveLoaders = savesLoadersService.GetLoaders((uint)pkmVersionEntity.AttachedSaveId!);
            var savePkms = saveLoaders.Pkms.GetDtosByIdBase(savePkmIdBase);
            if (savePkms.Count != 1)
            {
                throw new InvalidOperationException($"Multiple savePkms found ({savePkms.Count}) for pkmVersion.id={pkmVersionId} savePkmIdBase={savePkmIdBase}");
            }

            var savePkm = savePkms.First().Value;
            foreach (var version in pkmVersionEntities)
            {
                var pkm = await pkmVersionLoader.GetPKM(version);
                if (!pkm.IsEnabled)
                {
                    return;
                }

                // update xp etc,
                // and species/form only when possible

                var saveVersion = StaticDataService.GetSingleVersion(pkm.Version);
                var versionSave = BlankSaveFile.Get(saveVersion);
                var correctSpeciesForm = versionSave.Personal.IsPresentInGame(savePkm.Pkm.Species, savePkm.Pkm.Form);
                var attachedVersionEntity = await pkmVersionLoader.GetEntityBySave(savePkm.SaveId, savePkm.IdBase);
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

                    if (attachedVersionEntity?.Id == version.Id)
                    {
                        pkmConvertService.PassAllToPkmSafe(savePkm.Pkm, versionPkm);
                    }
                    else
                    {
                        pkmConvertService.PassAllDynamicsNItemToPkm(savePkm.Pkm, versionPkm);
                    }
                });

                var versionEntity = await pkmVersionLoader.GetEntity(version.Id);
                await pkmVersionLoader.UpdateEntity(versionEntity, pkm);
            }
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
            var pkmVersionEntities = (await pkmVersionLoader.GetEntitiesByBox(pkmVersionDto.BoxId, pkmVersionDto.BoxSlot)).Values.ToList();

            if (pkmVersionDto.AttachedSaveId == null)
            {
                throw new ArgumentException($"Cannot synchronize pkm detached from save, pkmVersion.id={pkmVersionId}");
            }

            var saveLoaders = savesLoadersService.GetLoaders((uint)pkmVersionDto.AttachedSaveId!);
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
                var versionEntity = await pkmVersionLoader.GetEntity(pkmVersionDto.Id);
                await pkmVersionLoader.UpdateEntity(versionEntity, versionPkm);
            }

            var attachedVersionEntity = await pkmVersionLoader.GetEntityBySave(savePkm.SaveId, savePkm.IdBase);
            savePkm = savePkm with
            {
                Pkm = savePkm.Pkm.Update(pkm =>
                {
                    if (attachedVersionEntity?.Id == pkmVersionDto.Id)
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
