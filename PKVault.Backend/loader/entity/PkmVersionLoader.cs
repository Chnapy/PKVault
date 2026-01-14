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
        pkmFileLoader = new(fileIOService, _settingsService, [.. GetAllEntities().Values]);
    }

    public PkmVersionDTO CreateDTO(PkmVersionEntity entity, ImmutablePKM pkm)
    {
        var filepathAbsolute = Path.Combine(settingsService.GetSettings().AppDirectory, entity.Filepath);
        var isFilePresent = fileIOService.Exists(filepathAbsolute);

        var dto = new PkmVersionDTO(
            Id: entity.Id,
            Generation: entity.Generation,
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

        var result = DeleteEntityOnly(id);

        pkmFileLoader.DeleteEntity(entityToRemove.Filepath);

        return result;
    }

    private bool DeleteEntityOnly(string id)
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

        return result;
    }

    public override PkmVersionEntity WriteEntity(PkmVersionEntity entity)
    {
        // required for specific case when pkm-id changes
        var existingEntity = GetEntity(entity.Id);
        if (existingEntity != null && entity.PkmId != existingEntity.PkmId)
        {
            DeleteEntityOnly(entity.Id);
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

        pkmFileLoader.WriteEntity(pkm, entity.Filepath);

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
        return pkmFileLoader.CreatePKM(entity);
    }

    public override int GetLastSchemaVersion() => 1;
}
