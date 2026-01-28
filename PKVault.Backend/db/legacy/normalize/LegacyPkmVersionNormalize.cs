public class LegacyPkmVersionNormalize(
    LegacyPkmVersionLoader loader, Dictionary<ushort, StaticEvolve> evolves
)
{
    public void MigrateGlobalEntities()
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

        migrateFn();

        MigrateGlobalEntities();
    }

    protected Action? GetMigrateFunc(int currentSchemaVersion) => currentSchemaVersion switch
    {
        0 => MigrateV0ToV1,
        _ => null
    };

    private void MigrateV0ToV1()
    {
        // Most part is done in LegacyPkmLoader for strong couplage reasons

        using var _ = LogUtil.Time($"PkmVersion normalize: MigrateV0ToV1");

        loader.GetAllEntities().Values.ToList().ForEach(entity => loader.WriteEntity(entity with { SchemaVersion = 1 }));
    }

    public void CleanData()
    {
        using var _ = LogUtil.Time($"PkmVersion normalize: CleanData rename pk filename if needed");
        // rename pk filename if needed
        loader.GetAllEntities().Values.ToList().ForEach(entity =>
        {
            var pkm = loader.GetPkmVersionEntityPkm(entity);
            if (pkm.HasLoadError)
            {
                return;
            }

            var oldFilepath = entity.Filepath;
            var expectedFilepath = loader.pkmFileLoader.GetPKMFilepath(pkm, evolves);

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