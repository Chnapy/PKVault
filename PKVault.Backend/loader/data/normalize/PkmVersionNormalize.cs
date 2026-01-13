public class PkmVersionNormalize(
    FileIOService fileIOService,
    PkmVersionLoader loader
) : DataNormalize<PkmVersionDTO, PkmVersionEntity>(loader)
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
        // Most part is done in PkmLoader for strong couplage reasons

        loader.GetAllEntities().Values.ToList().ForEach(entity => loader.WriteEntity(entity with { SchemaVersion = 1 }));
    }

    public override void CleanData(DataEntityLoaders loaders)
    {
        // remove pkmVersions with inconsistent data
        loader.GetAllEntities().Values.ToList().ForEach(pkmVersionEntity =>
        {
            var pkmEntity = loaders.pkmLoader.GetEntity(pkmVersionEntity.PkmId);
            if (pkmEntity == null)
            {
                loader.DeleteEntity(pkmVersionEntity.Id);
            }
            else
            {
                var boxEntity = loaders.boxLoader.GetEntity(pkmEntity!.BoxId.ToString());
                if (boxEntity == null)
                {
                    loader.DeleteEntity(pkmVersionEntity.Id);
                }
                else
                {
                    ImmutablePKM? pkm = null;
                    try
                    {
                        var pkmBytes = fileIOService.ReadBytes(pkmVersionEntity.Filepath);
                        pkm = PKMLoader.CreatePKM(pkmBytes, pkmVersionEntity);
                    }
                    catch (Exception ex)
                    {
                        Console.Error.WriteLine($"Path = {pkmVersionEntity.Filepath}");
                        Console.Error.WriteLine(ex);
                    }
                    if (pkm == null)
                    {
                        loader.DeleteEntity(pkmVersionEntity.Id);
                    }
                }
            }
        });

        // rename pk filename if needed
        loader.GetAllEntities().Values.ToList().ForEach(entity =>
        {
            var pkmBytes = fileIOService.ReadBytes(entity.Filepath);
            var pkm = PKMLoader.CreatePKM(pkmBytes, entity);

            var oldFilepath = entity.Filepath;
            var expectedFilepath = loader.pkmFileLoader.GetPKMFilepath(pkm);

            // update pk file
            if (expectedFilepath != oldFilepath)
            {
                // Console.WriteLine($"Wrong filepath rename:\n- wrong filepath={oldFilepath}\n- expected filepath={expectedFilepath}");

                entity = loader.WriteEntity(entity with { Filepath = expectedFilepath }, pkm);
            }

            oldFilepath = entity.Filepath;
            expectedFilepath = MatcherUtil.NormalizePath(entity.Filepath);

            // if filepath is not normalized
            if (oldFilepath != expectedFilepath)
            {
                // Console.WriteLine($"Normalize filepath rename:\n- wrong filepath={oldFilepath}\n- expected filepath={expectedFilepath}");

                entity = loader.WriteEntity(entity with { Filepath = expectedFilepath }, pkm);
            }
        });
    }
}