public class PkmLoader : EntityLoader<PkmDTO, PkmEntity>
{
    public PkmLoader() : base(
        filePath: MatcherUtil.NormalizePath(Path.Combine(SettingsService.AppSettings.SettingsMutable.DB_PATH, "pkm.json")),
        dictJsonContext: EntityJsonContext.Default.DictionaryStringPkmEntity
    )
    {
    }

    protected override PkmDTO GetDTOFromEntity(PkmEntity entity)
    {
        return PkmDTO.FromEntity(entity);
    }

    protected override PkmEntity GetEntityFromDTO(PkmDTO dto)
    {
        return dto.PkmEntity;
    }

    public override int GetLastSchemaVersion() => 1;

    public override void SetupInitialData(DataEntityLoaders loaders)
    {
    }

    protected override Action<DataEntityLoaders>? GetMigrateFunc(int currentSchemaVersion) => currentSchemaVersion switch
    {
        0 => MigrateV0ToV1,
        _ => null
    };

    private void MigrateV0ToV1(DataEntityLoaders loaders)
    {
        /**
         * Convert entities with old/wrong ID format to new one.
         * It checks:
         * - pkm entity ID
         * - pkmVersion entity ID
         * 
         * Write pkmVersion too because of couplage pkm-pkmVersion due to pkmVersion.PkmId
         */
        GetAllEntities().Values.ToList().ForEach(pkmEntity =>
        {
            var pkmVersions = loaders.pkmVersionLoader.GetEntitiesByPkmId(pkmEntity.Id).Values.ToList();

            pkmVersions.ForEach(pkmVersionEntity =>
            {
                try
                {
                    var pkmBytes = File.ReadAllBytes(pkmVersionEntity.Filepath);
                    var pkm = PKMLoader.CreatePKM(pkmBytes, pkmVersionEntity);

                    var oldId = pkmVersionEntity.Id;
                    var expectedId = BasePkmVersionDTO.GetPKMIdBase(pkm);

                    var oldPkmId = pkmVersionEntity.PkmId;

                    // wrong Id
                    if (expectedId != oldId)
                    {
                        // must be done first
                        loaders.pkmVersionLoader.DeleteEntity(oldId);

                        // update pkm-entity id if main version
                        if (oldPkmId == oldId)
                        {
                            pkmEntity.Id = expectedId;
                            loaders.pkmLoader.DeleteEntity(oldId);
                            loaders.pkmLoader.WriteEntity(pkmEntity);
                        }

                        // update pkm-version-entity id
                        pkmVersionEntity.Id = expectedId;
                        loaders.pkmVersionLoader.WriteEntity(pkmVersionEntity);
                    }
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine(ex);
                }
            });

            pkmVersions.ForEach(pkmVersionEntity =>
            {
                // wrong PkmId
                if (pkmVersionEntity.PkmId != pkmEntity.Id)
                {
                    pkmVersionEntity.PkmId = pkmEntity.Id;
                    loaders.pkmVersionLoader.WriteEntity(pkmVersionEntity);
                }
            });

            WriteEntity(new()
            {
                SchemaVersion = 1,
                Id = pkmEntity.Id,
                SaveId = pkmEntity.SaveId,
                BoxId = pkmEntity.BoxId,
                BoxSlot = pkmEntity.BoxSlot,
            });
        });
    }

    public override void CleanData(DataEntityLoaders loaders)
    {
        // remove pkms with no pkmVersions
        GetAllEntities().Values.ToList().ForEach(pkmEntity =>
        {
            var pkmVersions = loaders.pkmVersionLoader.GetEntitiesByPkmId(pkmEntity.Id).Values;
            if (pkmVersions.Count == 0)
            {
                DeleteEntity(pkmEntity.Id);
            }
        });
    }
}