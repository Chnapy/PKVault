public class PkmVersionLoader : EntityLoader<PkmVersionDTO, PkmVersionEntity>
{
    private readonly SettingsService settingsService;

    public readonly PKMLoader pkmFileLoader;
    private readonly PkmLoader pkmLoader;

    private readonly VersionChecker versionChecker = new();

    private Dictionary<string, Dictionary<string, PkmVersionEntity>>? entitiesByPkmId = null;

    public PkmVersionLoader(
        FileIOService fileIOService,
        SettingsService _settingsService,
        PkmLoader _pkmLoader
    ) : base(
        fileIOService,
        filePath: MatcherUtil.NormalizePath(Path.Combine(_settingsService.GetSettings().SettingsMutable.DB_PATH, "pkm-version.json")),
        dictJsonContext: EntityJsonContext.Default.DictionaryStringPkmVersionEntity
    )
    {
        settingsService = _settingsService;
        pkmLoader = _pkmLoader;
        pkmFileLoader = new(fileIOService, _settingsService, pkmLoader, [.. GetAllEntities().Values]);
    }

    public PkmVersionDTO CreateDTO(PkmVersionEntity entity, ImmutablePKM pkm)
    {
        var filepathAbsolute = Path.Combine(settingsService.GetSettings().AppDirectory, entity.Filepath);
        var isFilePresent = fileIOService.Exists(filepathAbsolute);

        var dto = new PkmVersionDTO(
            Id: entity.Id,
            Generation: entity.Generation,
            CanEdit: !pkm.IsEgg,
            SettingsLanguage: settingsService.GetSettings().GetSafeLanguage(),
            Pkm: pkm,

            PkmId: entity.PkmId,
            IsFilePresent: isFilePresent,
            Filepath: entity.Filepath,
            FilepathAbsolute: filepathAbsolute,

            versionChecker
        );

        if (dto.Id != entity.Id)
        {
            throw new Exception($"Id mismatch dto.id={dto.Id} entity.id={entity.Id}");
        }

        return dto;
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

    public PkmVersionDTO? GetPkmSaveVersion(PkmSaveDTO pkmSave)
    {
        var pkmVersion = GetDto(pkmSave.IdBase);
        if (pkmVersion == null)
        {
            return null;
        }

        var pkm = pkmLoader.GetEntity(pkmVersion.PkmId);
        if (pkm?.SaveId == pkmSave.Save.Id)
        {
            return pkmVersion;
        }
        return null;
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

    public override PkmVersionEntity WriteEntity(PkmVersionEntity entity)
    {
        // required for specific case when pkm-id changes
        var existingEntity = GetEntity(entity.Id);
        if (existingEntity != null && entity.PkmId != existingEntity.PkmId)
        {
            DeleteEntity(entity.Id);
        }

        entity = base.WriteEntity(entity);

        if (GetAllEntitiesByPkmId().TryGetValue(entity.PkmId, out var entities))
        {
            entities[entity.Id] = entity;
        }
        else
        {
            GetAllEntitiesByPkmId().Add(entity.PkmId, new() { { entity.Id, entity } });
        }
        return entity;
    }

    public PkmVersionEntity WriteEntity(PkmVersionEntity entity, ImmutablePKM pkm)
    {
        WriteEntity(entity);

        pkmFileLoader.WriteEntity(
            PKMLoader.GetPKMBytes(pkm), pkm, entity.Filepath
        );

        return entity;
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

    public override async Task WriteToFile()
    {
        await base.WriteToFile();

        pkmFileLoader.WriteToFiles();
    }

    protected override PkmVersionDTO GetDTOFromEntity(PkmVersionEntity entity)
    {
        var pkm = GetPkmVersionEntityPkm(entity);

        return CreateDTO(entity, pkm);
    }

    public ImmutablePKM GetPkmVersionEntityPkm(PkmVersionEntity entity)
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

        GetAllEntities().Values.ToList().ForEach(entity => WriteEntity(entity with { SchemaVersion = 1 }));
    }

    public override void CleanData(DataEntityLoaders loaders)
    {
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
                        DeleteEntity(pkmVersionEntity.Id);
                    }
                }
            }
        });

        // rename pk filename if needed
        GetAllEntities().Values.ToList().ForEach(entity =>
        {
            var pkmBytes = fileIOService.ReadBytes(entity.Filepath);
            var pkm = PKMLoader.CreatePKM(pkmBytes, entity);

            var oldFilepath = entity.Filepath;
            var expectedFilepath = pkmFileLoader.GetPKMFilepath(pkm);

            // update pk file
            if (expectedFilepath != oldFilepath)
            {
                // Console.WriteLine($"Wrong filepath rename:\n- wrong filepath={oldFilepath}\n- expected filepath={expectedFilepath}");

                entity = WriteEntity(entity with { Filepath = expectedFilepath }, pkm);
            }

            oldFilepath = entity.Filepath;
            expectedFilepath = MatcherUtil.NormalizePath(entity.Filepath);

            // if filepath is not normalized
            if (oldFilepath != expectedFilepath)
            {
                // Console.WriteLine($"Normalize filepath rename:\n- wrong filepath={oldFilepath}\n- expected filepath={expectedFilepath}");

                entity = WriteEntity(entity with { Filepath = expectedFilepath }, pkm);
            }
        });
    }
}
