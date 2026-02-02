using PKHeX.Core;

public record SynchronizePkmActionInput(
    (string PkmVariantId, string SavePkmIdBase)[] pkmVariantAndPkmSaveIds
);

public class SynchronizePkmAction(
    PkmConvertService pkmConvertService,
    IPkmVariantLoader pkmVariantLoader, ISavesLoadersService savesLoadersService
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

        var pkmVariantsBySaveId = await pkmVariantLoader.GetEntitiesAttachedGroupedBySave();

        List<SynchronizePkmActionInput> synchronizationData = [];

        foreach (var saveLoader in saveLoaders)
        {
            pkmVariantsBySaveId.TryGetValue(saveLoader.Save.Id, out var pkmVariantsBySave);

            var result = new List<(string PkmVariantId, string SavePkmIdBase)>();

            foreach (var pkmVariant in pkmVariantsBySave ?? [])
            {
                if (pkmVariant.AttachedSavePkmIdBase != null)
                {
                    var savePkms = saveLoader.Pkms.GetDtosByIdBase(pkmVariant.AttachedSavePkmIdBase);
                    if (savePkms.Count != 1)
                        continue;

                    var savePkm = savePkms.Values.First();
                    var versionPkm = await pkmVariantLoader.GetPKM(pkmVariant);

                    if (versionPkm.IsEnabled && versionPkm.DynamicChecksum != savePkm.DynamicChecksum)
                    {
                        result.Add((pkmVariant.Id, pkmVariant.AttachedSavePkmIdBase));
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
        await SynchronizeSaveToPkmVariant(input);

        var pkmVariantDto = await pkmVariantLoader.GetEntity(input.pkmVariantAndPkmSaveIds[0].PkmVariantId);

        return new(
            type: DataActionType.PKM_SYNCHRONIZE,
            parameters: [pkmVariantDto.AttachedSaveId, input.pkmVariantAndPkmSaveIds.Length]
        );
    }

    public async Task SynchronizeSaveToPkmVariant(SynchronizePkmActionInput input)
    {
        if (input.pkmVariantAndPkmSaveIds.Length == 0)
        {
            throw new ArgumentException($"Pkm main & pkm save ids cannot be empty");
        }

        async Task act(string pkmVariantId, string savePkmIdBase)
        {
            var pkmVariantEntity = await pkmVariantLoader.GetEntity(pkmVariantId);
            var pkmVariantEntities = (await pkmVariantLoader.GetEntitiesByBox(pkmVariantEntity.BoxId, pkmVariantEntity.BoxSlot)).Values.ToList();

            if (pkmVariantEntity.AttachedSaveId == null)
            {
                throw new ArgumentException($"Cannot synchronize pkm detached from save, pkmVariant.id={pkmVariantId}");
            }

            var saveLoaders = savesLoadersService.GetLoaders((uint)pkmVariantEntity.AttachedSaveId!);
            var savePkms = saveLoaders.Pkms.GetDtosByIdBase(savePkmIdBase);
            if (savePkms.Count != 1)
            {
                throw new InvalidOperationException($"Multiple savePkms found ({savePkms.Count}) for pkmVariant.id={pkmVariantId} savePkmIdBase={savePkmIdBase}");
            }

            var savePkm = savePkms.First().Value;
            foreach (var version in pkmVariantEntities)
            {
                var pkm = await pkmVariantLoader.GetPKM(version);
                if (!pkm.IsEnabled)
                {
                    return;
                }

                // update xp etc,
                // and species/form only when possible

                var saveVersion = StaticDataService.GetSingleVersion(pkm.Version);
                var versionSave = BlankSaveFile.Get(saveVersion);
                var correctSpeciesForm = versionSave.Personal.IsPresentInGame(savePkm.Pkm.Species, savePkm.Pkm.Form);
                var attachedVersionEntity = await pkmVariantLoader.GetEntityBySave(savePkm.SaveId, savePkm.IdBase);
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

                var versionEntity = await pkmVariantLoader.GetEntity(version.Id);
                await pkmVariantLoader.UpdateEntity(versionEntity, pkm);
            }
        }

        foreach (var (pkmVariantId, savePkmIdBase) in input.pkmVariantAndPkmSaveIds)
        {
            await act(pkmVariantId, savePkmIdBase);
        }
    }

    public async Task SynchronizePkmVariantToSave(SynchronizePkmActionInput input)
    {
        if (input.pkmVariantAndPkmSaveIds.Length == 0)
        {
            throw new ArgumentException($"Pkm main & pkm save ids cannot be empty");
        }

        async Task act(string pkmVariantId, string savePkmIdBase)
        {
            var pkmVariantEntity = await pkmVariantLoader.GetEntity(pkmVariantId);
            var pkmVariantEntities = (await pkmVariantLoader.GetEntitiesByBox(pkmVariantEntity.BoxId, pkmVariantEntity.BoxSlot)).Values.ToList();

            if (pkmVariantEntity.AttachedSaveId == null)
            {
                throw new ArgumentException($"Cannot synchronize pkm detached from save, pkmVariant.id={pkmVariantId}");
            }

            var saveLoaders = savesLoadersService.GetLoaders((uint)pkmVariantEntity.AttachedSaveId!);
            var savePkms = saveLoaders.Pkms.GetDtosByIdBase(savePkmIdBase);
            if (savePkms.Count != 1)
            {
                throw new InvalidOperationException($"Multiple savePkms found ({savePkms.Count}) for pkmVariant.id={pkmVariantId} savePkmIdBase={savePkmIdBase}");
            }

            var savePkm = savePkms.First().Value;
            if (savePkm == null)
            {
                Console.WriteLine($"Attached save pkm not found for pkmVariant.Id={pkmVariantId}");
            }

            var versionPkm = await pkmVariantLoader.GetPKM(pkmVariantEntity);

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
                var versionEntity = await pkmVariantLoader.GetEntity(pkmVariantEntity.Id);
                await pkmVariantLoader.UpdateEntity(versionEntity, versionPkm);
            }

            var attachedVersionEntity = await pkmVariantLoader.GetEntityBySave(savePkm.SaveId, savePkm.IdBase);
            savePkm = savePkm with
            {
                Pkm = savePkm.Pkm.Update(pkm =>
                {
                    if (attachedVersionEntity?.Id == pkmVariantEntity.Id)
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

        foreach (var (pkmVariantId, savePkmIdBase) in input.pkmVariantAndPkmSaveIds)
        {
            await act(pkmVariantId, savePkmIdBase);
        }
    }
}
