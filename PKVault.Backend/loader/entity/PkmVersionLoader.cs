public interface IPkmVersionLoader : IEntityLoader<PkmVersionDTO, PkmVersionEntity>
{
    public IPKMLoader pkmFileLoader { get; }

    public PkmVersionDTO CreateDTO(PkmVersionEntity entity, ImmutablePKM pkm);
    public Dictionary<string, Dictionary<string, PkmVersionEntity>> GetAllEntitiesByPkmId();
    public PkmVersionDTO? GetPkmSaveVersion(PkmSaveDTO pkmSave);
    public PkmVersionEntity WriteEntity(PkmVersionEntity entity, ImmutablePKM pkm);
    public Dictionary<string, PkmVersionDTO> GetDtosByPkmId(string pkmId);
    public Dictionary<string, PkmVersionEntity> GetEntitiesByPkmId(string pkmId);
    public ImmutablePKM GetPkmVersionEntityPkm(PkmVersionEntity entity);
}

public class PkmVersionLoader : EntityLoader<PkmVersionDTO, PkmVersionEntity>, IPkmVersionLoader
{
    private readonly string appPath;
    private readonly string language;
    private readonly Dictionary<ushort, StaticEvolve> evolves;

    public IPKMLoader pkmFileLoader { get; }
    private readonly IPkmLoader pkmLoader;

    private readonly VersionChecker versionChecker = new();

    private Dictionary<string, Dictionary<string, PkmVersionEntity>>? entitiesByPkmId = null;

    public PkmVersionLoader(
        IFileIOService fileIOService,
        string _appPath,
        string dbPath,
        string storagePath,
        string _language,
        Dictionary<ushort, StaticEvolve> _evolves,
        IPkmLoader _pkmLoader
    ) : base(
        fileIOService,
        filePath: MatcherUtil.NormalizePath(Path.Combine(dbPath, "pkm-version.json")),
        dictJsonContext: EntityJsonContext.Default.DictionaryStringPkmVersionEntity
    )
    {
        appPath = _appPath;
        language = _language;
        evolves = _evolves;
        pkmLoader = _pkmLoader;
        pkmFileLoader = new PKMLoader(fileIOService, storagePath, [.. GetAllEntities().Values]);
    }

    public PkmVersionDTO CreateDTO(PkmVersionEntity entity, ImmutablePKM pkm)
    {
        var filepathAbsolute = Path.Combine(appPath, entity.Filepath);
        var isFilePresent = fileIOService.Exists(filepathAbsolute);

        var dto = new PkmVersionDTO(
            Id: entity.Id,
            Generation: entity.Generation,
            SettingsLanguage: language,
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

        pkmFileLoader.WriteEntity(pkm, entity.Filepath, evolves);

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
