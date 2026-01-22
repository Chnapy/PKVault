using PKHeX.Core;

public class PkmNormalize(
    ILegacyPkmLoader loader, Dictionary<ushort, StaticEvolve> evolves
) : DataNormalize<LegacyPkmEntity, LegacyPkmEntity>(loader)
{
    public override void SetupInitialData(DataEntityLoaders loaders)
    {
    }

    protected override Action<DataEntityLoaders>? GetMigrateFunc(int currentSchemaVersion) => currentSchemaVersion switch
    {
        0 => MigrateV0ToV1,
        1 => MigrateV1ToV2,
        2 => MigrateV2ToV3,
        _ => null
    };

    private void MigrateV0ToV1(DataEntityLoaders loaders)
    {
        var time = LogUtil.Time($"Pkm normalize: MigrateV0ToV1");
        /**
         * Convert entities with old/wrong ID format to new one.
         * It checks:
         * - pkm entity ID
         * - pkmVersion entity ID
         * 
         * Write pkmVersion too because of couplage pkm-pkmVersion due to pkmVersion.PkmId
         */
        loader.GetAllEntities().Values.ToList().ForEach(pkmEntity =>
        {
            var oldPkmEntityId = pkmEntity.Id;
            loaders.pkmVersionLoader.GetAllEntities().Values.ToList().ForEach(pkmVersionEntity =>
            {
                if (pkmVersionEntity.PkmId != pkmEntity.Id)
                {
                    return;
                }

                var pkm = loaders.pkmVersionLoader.GetPkmVersionEntityPkm(pkmVersionEntity);
                if (!pkm.IsEnabled)
                {
                    return;
                }

                var oldId = pkmVersionEntity.Id;
                var expectedId = pkm.GetPKMIdBase(evolves);

                var isMainVersion = pkmVersionEntity.PkmId == oldId;

                // must be done first
                loaders.pkmVersionLoader.DeleteEntity(oldId);

                // update pkm-entity id if main version
                if (isMainVersion)
                {
                    pkmEntity = loaders.legacyPkmLoader.WriteEntity(pkmEntity with { Id = expectedId });
                }

                var filepath = loaders.pkmVersionLoader.pkmFileLoader.GetPKMFilepath(pkm, evolves);

                // update pkm-version-entity id
                pkmVersionEntity = loaders.pkmVersionLoader.WriteEntity(
                    pkmVersionEntity with { Id = expectedId, Filepath = filepath },
                    pkm);
            });

            if (pkmEntity.Id != oldPkmEntityId)
            {
                loaders.pkmVersionLoader.GetAllEntities().Values.ToList().ForEach(pkmVersionEntity =>
                {
                    if (pkmVersionEntity.PkmId != oldPkmEntityId)
                    {
                        return;
                    }

                    // wrong PkmId
                    pkmVersionEntity = loaders.pkmVersionLoader.WriteEntity(pkmVersionEntity with { PkmId = pkmEntity.Id });
                });

                loader.DeleteEntity(oldPkmEntityId);
            }

            pkmEntity = loader.WriteEntity(pkmEntity with { SchemaVersion = 1 });
        });
        time();
    }

    private void MigrateV1ToV2(DataEntityLoaders loaders)
    {
        var time = LogUtil.Time($"Pkm normalize: MigrateV1ToV2");
        /**
         * Convert Shedinja pkm entities with old ID format to new one.
         * It checks:
         * - pkm entity ID
         * - pkmVersion entity ID
         * - pk file filename
         * 
         * Write pkmVersion too because of couplage pkm-pkmVersion due to pkmVersion.PkmId
         */
        loader.GetAllEntities().Values.ToList().ForEach(pkmEntity =>
        {
            var oldPkmEntityId = pkmEntity.Id;
            loaders.pkmVersionLoader.GetAllEntities().Values.ToList().ForEach(pkmVersionEntity =>
            {
                if (pkmVersionEntity.PkmId != oldPkmEntityId)
                {
                    return;
                }

                var pkm = loaders.pkmVersionLoader.GetPkmVersionEntityPkm(pkmVersionEntity);
                if (!pkm.IsEnabled)
                {
                    return;
                }

                if (pkm.Species == (ushort)Species.Shedinja)
                {
                    var oldId = pkmVersionEntity.Id;
                    var expectedId = pkm.GetPKMIdBase(evolves);

                    var isMainVersion = pkmVersionEntity.PkmId == oldId;

                    // must be done first
                    loaders.pkmVersionLoader.DeleteEntity(oldId);

                    // update pkm-entity id if main version
                    if (isMainVersion)
                    {
                        pkmEntity = loaders.legacyPkmLoader.WriteEntity(pkmEntity with { Id = expectedId });
                    }

                    var filepath = loaders.pkmVersionLoader.pkmFileLoader.GetPKMFilepath(pkm, evolves);

                    // update pkm-version-entity id
                    pkmVersionEntity = loaders.pkmVersionLoader.WriteEntity(
                        pkmVersionEntity with { Id = expectedId, Filepath = filepath },
                        pkm);
                }
            });

            if (pkmEntity.Id != oldPkmEntityId)
            {
                loaders.pkmVersionLoader.GetAllEntities().Values.ToList().ForEach(pkmVersionEntity =>
                {
                    if (pkmVersionEntity.PkmId != oldPkmEntityId)
                    {
                        return;
                    }

                    // wrong PkmId
                    pkmVersionEntity = loaders.pkmVersionLoader.WriteEntity(pkmVersionEntity with { PkmId = pkmEntity.Id });
                });

                loader.DeleteEntity(oldPkmEntityId);
            }

            pkmEntity = loader.WriteEntity(pkmEntity with { SchemaVersion = 2 });
        });
        time();
    }

    private void MigrateV2ToV3(DataEntityLoaders loaders)
    {
        var time = LogUtil.Time($"Pkm normalize: MigrateV2ToV3");
        /**
         * 
         */
        loader.GetAllEntities().Values.ToList().ForEach(pkmEntity =>
        {
            var oldPkmEntityId = pkmEntity.Id;
            loaders.pkmVersionLoader.GetAllEntities().Values.ToList().ForEach(pkmVersionEntity =>
            {
                if (pkmVersionEntity.PkmId != oldPkmEntityId)
                {
                    return;
                }

                uint? attachedSaveId = null;
                string? attachedSavePkmIdBase = null;
                if (pkmEntity.SaveId != null && loaders.saveLoadersDict.TryGetValue((uint)pkmEntity.SaveId, out var saveLoader))
                {
                    if (saveLoader.Save.Generation == pkmVersionEntity.Generation)
                    {
                        attachedSaveId = pkmEntity.SaveId;
                        attachedSavePkmIdBase = pkmVersionEntity.Id;
                    }
                }

                loaders.pkmVersionLoader.WriteEntity(pkmVersionEntity with
                {
                    BoxId = (int)pkmEntity.BoxId,
                    BoxSlot = (int)pkmEntity.BoxSlot,
                    IsMain = pkmEntity.Id == pkmVersionEntity.Id,
                    AttachedSaveId = attachedSaveId,
                    AttachedSavePkmIdBase = attachedSavePkmIdBase
                });
            });

            pkmEntity = loader.WriteEntity(pkmEntity with { SchemaVersion = 3 });
        });
        time();
    }

    public override void CleanData(DataEntityLoaders loaders)
    {
        var time = LogUtil.Time($"Pkm normalize: CleanData remove pkms with no pkmVersions");
        // remove pkms with no pkmVersions
        loader.GetAllEntities().Values.ToList().ForEach(pkmEntity =>
        {
            var pkmVersions = loaders.pkmVersionLoader.GetAllEntities().Values.Where(pkmVersionEntity => pkmVersionEntity.PkmId == pkmEntity.Id);
            if (!pkmVersions.Any())
            {
                loader.DeleteEntity(pkmEntity.Id);
            }
        });

        time();
    }
}