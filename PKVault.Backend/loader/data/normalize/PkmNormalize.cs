public class PkmNormalize(
    FileIOService fileIOService,
    PkmLoader loader
) : DataNormalize<PkmDTO, PkmEntity>(loader)
{
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
        loader.GetAllEntities().Values.ToList().ForEach(pkmEntity =>
        {
            var pkmVersions = loaders.pkmVersionLoader.GetEntitiesByPkmId(pkmEntity.Id).Values.ToList();

            pkmVersions.ForEach(pkmVersionEntity =>
            {
                try
                {
                    var pkmBytes = fileIOService.ReadBytes(pkmVersionEntity.Filepath);
                    var pkm = PKMLoader.CreatePKM(pkmBytes, pkmVersionEntity);

                    var oldId = pkmVersionEntity.Id;
                    var expectedId = pkm.GetPKMIdBase();

                    var oldPkmId = pkmVersionEntity.PkmId;

                    // wrong Id
                    if (expectedId != oldId)
                    {
                        // must be done first
                        loaders.pkmVersionLoader.DeleteEntity(oldId);

                        // update pkm-entity id if main version
                        if (oldPkmId == oldId)
                        {
                            loaders.pkmLoader.DeleteEntity(oldId);
                            pkmEntity = loaders.pkmLoader.WriteEntity(pkmEntity with { Id = expectedId });
                        }

                        // update pkm-version-entity id
                        pkmVersionEntity = loaders.pkmVersionLoader.WriteEntity(pkmVersionEntity with { Id = expectedId });
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
                    pkmVersionEntity = loaders.pkmVersionLoader.WriteEntity(pkmVersionEntity with { PkmId = pkmEntity.Id });
                }
            });

            pkmEntity = loader.WriteEntity(pkmEntity with { SchemaVersion = 1 });
        });
    }

    public override void CleanData(DataEntityLoaders loaders)
    {
        // remove pkms with no pkmVersions
        loader.GetAllEntities().Values.ToList().ForEach(pkmEntity =>
        {
            var pkmVersions = loaders.pkmVersionLoader.GetEntitiesByPkmId(pkmEntity.Id).Values;
            if (pkmVersions.Count == 0)
            {
                loader.DeleteEntity(pkmEntity.Id);
            }
        });
    }
}