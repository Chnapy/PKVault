using PKHeX.Core;

public record SynchronizePkmActionInput(
    (string PkmVariantId, string SavePkmIdBase)[] pkmVariantAndPkmSaveIds,
    bool forceHeldItem = false
);

public class SynchronizePkmAction(
    ILogger<SynchronizePkmAction> log,
    IPkmSharePropertiesService pkmSharePropertiesService,
    IPkmVariantLoader pkmVariantLoader, ISavesLoadersService savesLoadersService
) : DataAction<SynchronizePkmActionInput>
{
    public async Task<SynchronizePkmActionInput[]> GetSavesPkmsToSynchronize()
    {
        var saveLoaders = savesLoadersService.GetAllLoaders();

        if (saveLoaders.Length == 0)
        {
            return [];
        }

        using var _ = log.Time($"Check saves to synchronize ({saveLoaders.Length} saves)");

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
                    var variantPkm = await pkmVariantLoader.GetPKM(pkmVariant);

                    if (variantPkm.IsEnabled && variantPkm.DynamicChecksum != savePkm.DynamicChecksum)
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
            log.LogInformation($"Synchronize save->variant {savePkmIdBase} -> {pkmVariantId}");

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
            foreach (var variant in pkmVariantEntities)
            {
                log.LogDebug($"Synchronize save->variant loop - {savePkm.IdBase} -> {variant.Id}");

                var variantPkm = await pkmVariantLoader.GetPKM(variant);
                if (!variantPkm.IsEnabled)
                {
                    log.LogDebug($"!variantPkm.IsEnabled => {variant.Id}");
                    continue;
                }

                var versions = Enum.GetValues<GameVersion>().Where(version =>
                    version.IsValidSavedVersion()
                    && version.SaveFileType > 0
                    && version.Context == variantPkm.Context
                );

                var correctSpeciesForm = savePkm.Pkm.Species >= variantPkm.Species
                    && versions.Any(version => BlankSaveFile.Get(version).Personal.IsPresentInGame(savePkm.Pkm.Species, savePkm.Pkm.Form));
                if (!correctSpeciesForm)
                {
                    log.LogDebug($"!correctSpeciesForm => {variant.Id} / {savePkm.Pkm.Species} {savePkm.Pkm.Form} / {savePkm.Pkm.Species} {variantPkm.Species}");
                    continue;
                }

                variantPkm = variantPkm.Update(pkm =>
                {
                    pkmSharePropertiesService.SharePropertiesTo(savePkm.Pkm, pkm, savePkm.Save.GetSave(), input.forceHeldItem);
                });

                var variantEntity = await pkmVariantLoader.GetEntity(variant.Id);
                await pkmVariantLoader.UpdateEntity(variantEntity, variantPkm);
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
            log.LogInformation($"Synchronize variant->save {pkmVariantId} -> {savePkmIdBase}");

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
                log.LogDebug($"Attached save pkm not found for pkmVariant.Id={pkmVariantId}");
                return;
            }

            var variantPkm = await pkmVariantLoader.GetPKM(pkmVariantEntity);

            var correctSpeciesForm = saveLoaders.Save.Personal.IsPresentInGame(variantPkm.Species, variantPkm.Form);
            if (!correctSpeciesForm)
            {
                return;
            }

            if (saveLoaders.Save.Language != 0 && saveLoaders.Save.Language != variantPkm.Language)
            {
                variantPkm = variantPkm.Update(pkm =>
                {
                    pkm.Language = saveLoaders.Save.Language;
                });
                var variantEntity = await pkmVariantLoader.GetEntity(pkmVariantEntity.Id);
                await pkmVariantLoader.UpdateEntity(variantEntity, variantPkm);
            }

            var attachedVariantEntity = await pkmVariantLoader.GetEntityBySave(savePkm.SaveId, savePkm.IdBase);

            savePkm = savePkm with
            {
                Pkm = savePkm.Pkm.Update(pkm =>
                {
                    pkmSharePropertiesService.SharePropertiesTo(variantPkm, pkm, savePkm.Save.GetSave(), input.forceHeldItem);
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
