using PKHeX.Core;

public class PkmVersionLoader : EntityLoader<PkmVersionDTO, PkmVersionEntity>
{
    public readonly PKMMemoryLoader pkmFileLoader;
    private PkmLoader pkmLoader;

    private Dictionary<string, Dictionary<string, PkmVersionEntity>>? entitiesByPkmId = null;

    public PkmVersionLoader(
        PkmLoader _pkmLoader
    ) : base(
        filePath: MatcherUtil.NormalizePath(Path.Combine(SettingsService.AppSettings.SettingsMutable.DB_PATH, "pkm-version.json")),
        dictJsonContext: EntityJsonContext.Default.DictionaryStringPkmVersionEntity
    )
    {
        pkmLoader = _pkmLoader;
        pkmFileLoader = new(pkmLoader, [.. GetAllEntities().Values]);
    }

    public Dictionary<string, Dictionary<string, PkmVersionEntity>> GetAllEntitiesByPkmId()
    {
        entitiesByPkmId ??= GetEntitiesByPkmId(GetAllEntities());

        return entitiesByPkmId;
    }

    private Dictionary<string, Dictionary<string, PkmVersionEntity>> GetEntitiesByPkmId(Dictionary<string, PkmVersionEntity> entitiesById)
    {
        Dictionary<string, Dictionary<string, PkmVersionEntity>> entitiesByPkmId = [];

        entitiesById.Values.ToList().ForEach(entity =>
        {
            if (entitiesByPkmId.TryGetValue(entity.PkmId, out var entities))
            {
                entities.Add(entity.Id, entity);
            }
            else
            {
                entitiesByPkmId.Add(entity.PkmId, new() { { entity.Id, entity } });
            }
        });

        return entitiesByPkmId;
    }

    public override bool DeleteEntity(string id)
    {
        var entityToRemove = GetEntity(id);
        if (entityToRemove == null)
        {
            return false;
        }

        var result = base.DeleteEntity(id);

        if (GetAllEntitiesByPkmId().TryGetValue(entityToRemove.PkmId, out var entities))
        {
            entities.Remove(id);
        }

        pkmFileLoader.DeleteEntity(entityToRemove.Filepath);

        return result;
    }

    public override void WriteEntity(PkmVersionEntity entity)
    {
        // required for specific case when pkm-id changes
        var existingEntity = GetEntity(entity.Id);
        if (existingEntity != null && entity.PkmId != existingEntity.PkmId)
        {
            DeleteEntity(entity.Id);
        }

        base.WriteEntity(entity);

        if (GetAllEntitiesByPkmId().TryGetValue(entity.PkmId, out var entities))
        {
            entities[entity.Id] = entity;
        }
        else
        {
            GetAllEntitiesByPkmId().Add(entity.PkmId, new() { { entity.Id, entity } });
        }
    }

    public override void WriteDto(PkmVersionDTO dto)
    {
        base.WriteDto(dto);

        pkmFileLoader.WriteEntity(
            PKMLoader.GetPKMBytes(dto.Pkm), dto.Pkm, dto.PkmVersionEntity.Filepath
        );
    }

    public Dictionary<string, PkmVersionDTO> GetDtosByPkmId(string pkmId)
    {
        return GetEntitiesByPkmId(pkmId)
            .ToDictionary(pair => pair.Key, pair => GetDTOFromEntity(pair.Value));
    }

    public Dictionary<string, PkmVersionEntity> GetEntitiesByPkmId(string pkmId)
    {
        if (GetAllEntitiesByPkmId().TryGetValue(pkmId, out var entities))
        {
            return entities;
        }
        return [];
    }

    public override void WriteToFile()
    {
        base.WriteToFile();

        pkmFileLoader.WriteToFiles();
    }

    protected override PkmVersionDTO GetDTOFromEntity(PkmVersionEntity entity)
    {
        var pkmDto = pkmLoader.GetDto(entity.PkmId);
        var pkm = GetPkmVersionEntityPkm(entity);

        return PkmVersionDTO.FromEntity(entity, pkm, pkmDto!);
    }

    protected override PkmVersionEntity GetEntityFromDTO(PkmVersionDTO dto)
    {
        return dto.PkmVersionEntity;
    }

    public PKM GetPkmVersionEntityPkm(PkmVersionEntity entity)
    {
        var pkmBytes = pkmFileLoader.GetEntity(entity.Filepath)
            ?? throw new Exception($"PKM bytes is null, from entity Id={entity.Id} Filepath={entity.Filepath}");
        var pkm = PKMLoader.CreatePKM(pkmBytes, entity);
        if (pkm == default)
        {
            throw new Exception($"PKM is null, from entity Id={entity.Id} Filepath={entity.Filepath} bytes.length={pkmBytes.Length}");
        }

        return pkm;
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
        // Most part is done in PkmLoader for strong couplage reasons

        GetAllEntities().Values.ToList().ForEach(entity => WriteEntity(new()
        {
            SchemaVersion = 1,
            Id = entity.Id,
            PkmId = entity.PkmId,
            Generation = entity.Generation,
            Filepath = entity.Filepath
        }));
    }

    public override void CleanData(DataEntityLoaders loaders)
    {
        // rename pk filename if needed
        GetAllEntities().Values.ToList().ForEach(pkmVersionEntity =>
        {
            var pkmBytes = File.ReadAllBytes(pkmVersionEntity.Filepath);
            var pkm = PKMLoader.CreatePKM(pkmBytes, pkmVersionEntity);

            var oldFilepath = pkmVersionEntity.Filepath;
            var expectedFilepath = PKMLoader.GetPKMFilepath(pkm);

            // update pk file
            if (expectedFilepath != oldFilepath)
            {
                if (File.Exists(oldFilepath))
                {
                    Console.WriteLine($"Copy {oldFilepath} to {expectedFilepath}");
                    File.Copy(oldFilepath, expectedFilepath, true);
                }
                pkmVersionEntity.Filepath = expectedFilepath;
                WriteEntity(pkmVersionEntity);
            }

            // if filepath is not normalized
            if (pkmVersionEntity.Filepath != MatcherUtil.NormalizePath(pkmVersionEntity.Filepath))
            {
                pkmVersionEntity.Filepath = MatcherUtil.NormalizePath(pkmVersionEntity.Filepath);
                WriteEntity(pkmVersionEntity);
            }
        });

        // remove pkmVersions with inconsistent data
        GetAllEntities().Values.ToList().ForEach(pkmVersionEntity =>
        {
            var pkmEntity = pkmLoader.GetEntity(pkmVersionEntity.PkmId);
            if (pkmEntity == null)
            {
                DeleteEntity(pkmVersionEntity.Id);
            }
            else
            {
                var boxEntity = loaders.boxLoader.GetEntity(pkmEntity!.BoxId.ToString());
                if (boxEntity == null)
                {
                    DeleteEntity(pkmVersionEntity.Id);
                }
                else
                {
                    PKM? pkm = null;
                    try
                    {
                        var pkmBytes = File.ReadAllBytes(pkmVersionEntity.Filepath);
                        pkm = PKMLoader.CreatePKM(pkmBytes, pkmVersionEntity);
                    }
                    catch (Exception ex)
                    {
                        Console.Error.WriteLine($"Path = {pkmVersionEntity.Filepath}");
                        Console.Error.WriteLine(ex);
                    }
                    if (pkm == null)
                    {
                        DeleteEntity(pkmVersionEntity.Id);
                    }
                }
            }
        });
    }
}
