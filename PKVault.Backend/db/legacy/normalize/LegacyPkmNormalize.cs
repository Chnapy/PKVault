using PKHeX.Core;

public class LegacyPkmNormalize(
    LegacyPkmLoader loader, Dictionary<ushort, StaticEvolve> evolves
)
{
    public void MigrateGlobalEntities(LegacyPkmVersionLoader pkmVersionLoader, Dictionary<uint, SaveWrapper> savesDict)
    {
        var entities = loader.GetAllEntities();
        if (entities.Count == 0)
        {
            return;
        }

        var firstItem = entities.First().Value;
        if (firstItem == null)
        {
            return;
        }

        if (firstItem.SchemaVersion == loader.GetLastSchemaVersion())
        {
            return;
        }

        var migrateFn = GetMigrateFunc(firstItem.SchemaVersion) ?? throw new NotSupportedException($"Schema version {firstItem.SchemaVersion}");

        migrateFn(pkmVersionLoader, savesDict);

        MigrateGlobalEntities(pkmVersionLoader, savesDict);
    }

    protected Action<LegacyPkmVersionLoader, Dictionary<uint, SaveWrapper>>? GetMigrateFunc(int currentSchemaVersion) => currentSchemaVersion switch
    {
        0 => MigrateV0ToV1,
        1 => MigrateV1ToV2,
        2 => MigrateV2ToV3,
        _ => null
    };

    private void MigrateV0ToV1(LegacyPkmVersionLoader pkmVersionLoader, Dictionary<uint, SaveWrapper> savesDict)
    {
        using var _ = LogUtil.Time($"Pkm normalize: MigrateV0ToV1");
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
            pkmVersionLoader.GetAllEntities().Values.ToList().ForEach(pkmVersionEntity =>
            {
                if (pkmVersionEntity.PkmId != pkmEntity.Id)
                {
                    return;
                }

                var pkm = pkmVersionLoader.GetPkmVersionEntityPkm(pkmVersionEntity);
                if (!pkm.IsEnabled)
                {
                    return;
                }

                var oldId = pkmVersionEntity.Id;
                var expectedId = pkm.GetPKMIdBase(evolves);

                var isMainVersion = pkmVersionEntity.PkmId == oldId;

                // must be done first
                pkmVersionLoader.DeleteEntity(oldId);

                // update pkm-entity id if main version
                if (isMainVersion)
                {
                    pkmEntity = loader.WriteEntity(pkmEntity with { Id = expectedId });
                }

                var filepath = pkmVersionLoader.pkmFileLoader.GetPKMFilepath(pkm, evolves);

                // update pkm-version-entity id
                pkmVersionEntity = pkmVersionLoader.WriteEntity(
                    pkmVersionEntity with { Id = expectedId, Filepath = filepath },
                    pkm);
            });

            if (pkmEntity.Id != oldPkmEntityId)
            {
                pkmVersionLoader.GetAllEntities().Values.ToList().ForEach(pkmVersionEntity =>
                {
                    if (pkmVersionEntity.PkmId != oldPkmEntityId)
                    {
                        return;
                    }

                    // wrong PkmId
                    pkmVersionEntity = pkmVersionLoader.WriteEntity(pkmVersionEntity with { PkmId = pkmEntity.Id });
                });

                loader.DeleteEntity(oldPkmEntityId);
            }

            pkmEntity = loader.WriteEntity(pkmEntity with { SchemaVersion = 1 });
        });
    }

    private void MigrateV1ToV2(LegacyPkmVersionLoader pkmVersionLoader, Dictionary<uint, SaveWrapper> savesDict)
    {
        using var _ = LogUtil.Time($"Pkm normalize: MigrateV1ToV2");
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
            pkmVersionLoader.GetAllEntities().Values.ToList().ForEach(pkmVersionEntity =>
            {
                if (pkmVersionEntity.PkmId != oldPkmEntityId)
                {
                    return;
                }

                var pkm = pkmVersionLoader.GetPkmVersionEntityPkm(pkmVersionEntity);
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
                    pkmVersionLoader.DeleteEntity(oldId);

                    // update pkm-entity id if main version
                    if (isMainVersion)
                    {
                        pkmEntity = loader.WriteEntity(pkmEntity with { Id = expectedId });
                    }

                    var filepath = pkmVersionLoader.pkmFileLoader.GetPKMFilepath(pkm, evolves);

                    // update pkm-version-entity id
                    pkmVersionEntity = pkmVersionLoader.WriteEntity(
                        pkmVersionEntity with { Id = expectedId, Filepath = filepath },
                        pkm);
                }
            });

            if (pkmEntity.Id != oldPkmEntityId)
            {
                pkmVersionLoader.GetAllEntities().Values.ToList().ForEach(pkmVersionEntity =>
                {
                    if (pkmVersionEntity.PkmId != oldPkmEntityId)
                    {
                        return;
                    }

                    // wrong PkmId
                    pkmVersionEntity = pkmVersionLoader.WriteEntity(pkmVersionEntity with { PkmId = pkmEntity.Id });
                });

                loader.DeleteEntity(oldPkmEntityId);
            }

            pkmEntity = loader.WriteEntity(pkmEntity with { SchemaVersion = 2 });
        });
    }

    private void MigrateV2ToV3(LegacyPkmVersionLoader pkmVersionLoader, Dictionary<uint, SaveWrapper> savesDict)
    {
        using var _ = LogUtil.Time($"Pkm normalize: MigrateV2ToV3");
        /**
         * 
         */
        loader.GetAllEntities().Values.ToList().ForEach(pkmEntity =>
        {
            var oldPkmEntityId = pkmEntity.Id;
            pkmVersionLoader.GetAllEntities().Values.ToList().ForEach(pkmVersionEntity =>
            {
                if (pkmVersionEntity.PkmId != oldPkmEntityId)
                {
                    return;
                }

                uint? attachedSaveId = null;
                string? attachedSavePkmIdBase = null;
                if (pkmEntity.SaveId != null && savesDict.TryGetValue((uint)pkmEntity.SaveId, out var save))
                {
                    if (save.Generation == pkmVersionEntity.Generation)
                    {
                        attachedSaveId = pkmEntity.SaveId;
                        attachedSavePkmIdBase = pkmVersionEntity.Id;
                    }
                }

                pkmVersionLoader.WriteEntity(pkmVersionEntity with
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
    }

    public void CleanData(LegacyPkmVersionLoader pkmVersionLoader)
    {
        using var _ = LogUtil.Time($"Pkm normalize: CleanData remove pkms with no pkmVersions");
        // remove pkms with no pkmVersions
        loader.GetAllEntities().Values.ToList().ForEach(pkmEntity =>
        {
            var pkmVersions = pkmVersionLoader.GetAllEntities().Values.Where(pkmVersionEntity => pkmVersionEntity.PkmId == pkmEntity.Id);
            if (!pkmVersions.Any())
            {
                loader.DeleteEntity(pkmEntity.Id);
            }
        });
    }
}