using System.Collections.Immutable;

public interface IPkmVersionLoader : IEntityLoader<PkmVersionDTO, PkmVersionEntity>
{
    public IPKMLoader pkmFileLoader { get; }

    public PkmVersionDTO CreateDTO(PkmVersionEntity entity, ImmutablePKM pkm);
    public PkmVersionEntity WriteEntity(PkmVersionEntity entity, ImmutablePKM pkm);
    public ImmutableDictionary<int, ImmutableDictionary<string, PkmVersionEntity>> GetEntitiesByBox(int boxId);
    public ImmutableDictionary<string, PkmVersionEntity> GetEntitiesByBox(int boxId, int boxSlot);
    public ImmutableDictionary<string, PkmVersionEntity> GetEntitiesBySave(uint saveId);
    public PkmVersionEntity? GetEntityBySave(uint saveId, string savePkmIdBase);
    public ImmutablePKM GetPkmVersionEntityPkm(PkmVersionEntity entity);
}

public class PkmVersionLoader : EntityLoader<PkmVersionDTO, PkmVersionEntity>, IPkmVersionLoader
{
    private readonly string appPath;
    private readonly string language;
    private readonly Dictionary<ushort, StaticEvolve> evolves;

    public IPKMLoader pkmFileLoader { get; }

    private readonly VersionChecker versionChecker = new();

    // boxId => boxSlot => PkmVersionEntity.Id => PkmVersionEntity
    private Dictionary<int, Dictionary<int, Dictionary<string, PkmVersionEntity>>> entitiesByBox = [];

    // saveId => attachedSavePkmIdBase => PkmVersionEntity
    private Dictionary<uint, Dictionary<string, PkmVersionEntity>> entitiesBySave = [];

    private bool NeedUpdate = true;

    public PkmVersionLoader(
        IFileIOService fileIOService,
        string _appPath,
        string dbPath,
        string storagePath,
        string _language,
        Dictionary<ushort, StaticEvolve> _evolves
    ) : base(
        fileIOService,
        filePath: MatcherUtil.NormalizePath(Path.Combine(dbPath, "pkm-version.json")),
        dictJsonContext: EntityJsonContext.Default.DictionaryStringPkmVersionEntity
    )
    {
        appPath = _appPath;
        language = _language;
        evolves = _evolves;
        pkmFileLoader = new PKMLoader(fileIOService, storagePath, [.. GetAllEntities().Values.Select(pv => pv.Filepath)]);
    }

    public PkmVersionDTO CreateDTO(PkmVersionEntity entity, ImmutablePKM pkm)
    {
        AssertIsNotLegacy(entity);

        var filepathAbsolute = Path.Combine(appPath, entity.Filepath);
        var isFilePresent = fileIOService.Exists(filepathAbsolute);

        var dto = new PkmVersionDTO(
            Id: entity.Id,
            Generation: entity.Generation,
            SettingsLanguage: language,
            Pkm: pkm,

            BoxId: (int)entity.BoxId!,
            BoxSlot: (int)entity.BoxSlot!,
            IsMain: (bool)entity.IsMain!,
            AttachedSaveId: entity.AttachedSaveId,
            AttachedSavePkmIdBase: entity.AttachedSavePkmIdBase,

            IsFilePresent: isFilePresent,
            Filepath: entity.Filepath,
            FilepathAbsolute: filepathAbsolute,

            VersionChecker: versionChecker,
            Evolves: evolves
        );

        return dto;
    }

    public ImmutableDictionary<int, ImmutableDictionary<string, PkmVersionEntity>> GetEntitiesByBox(int boxId)
    {
        SetupEntities();

        return entitiesByBox.TryGetValue(boxId, out var boxEntities)
            ? boxEntities.ToImmutableDictionary(
                entry => entry.Key,
                entry => entry.Value.ToImmutableDictionary()
            )
            : [];
    }

    public ImmutableDictionary<string, PkmVersionEntity> GetEntitiesByBox(int boxId, int boxSlot)
    {
        SetupEntities();

        return entitiesByBox.TryGetValue(boxId, out var boxEntities) && boxEntities.TryGetValue(boxSlot, out var entities)
            ? entities.ToImmutableDictionary()
            : [];
    }

    public ImmutableDictionary<string, PkmVersionEntity> GetEntitiesBySave(uint saveId)
    {
        SetupEntities();

        return entitiesBySave.TryGetValue(saveId, out var entities)
            ? entities.ToImmutableDictionary()
            : [];
    }

    public PkmVersionEntity? GetEntityBySave(uint saveId, string savePkmIdBase)
    {
        return GetEntitiesBySave(saveId).TryGetValue(savePkmIdBase, out var entity) ? entity : null;
    }

    public override Dictionary<string, PkmVersionEntity> GetAllEntities()
    {
        SetupEntities();

        return entitiesById!;
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

        var boxKey = GetEntityByBoxKey(entityToRemove.BoxId ?? -1, entityToRemove.BoxSlot ?? -1);
        var saveId = entityToRemove.AttachedSaveId ?? 0;
        var savePkmIdBase = entityToRemove.AttachedSavePkmIdBase ?? "";

        var result = base.DeleteEntity(id);

        if (entitiesByBox.TryGetValue(entityToRemove.BoxId ?? -1, out var boxEntities)
            && boxEntities.TryGetValue(entityToRemove.BoxSlot ?? -1, out var slotEntities))
        {
            slotEntities.Remove(id);
        }

        if (entitiesBySave.TryGetValue(saveId, out var saveEntities))
        {
            saveEntities.Remove(savePkmIdBase);
        }

        return result;
    }

    public override PkmVersionEntity WriteEntity(PkmVersionEntity entity)
    {
        SetupEntities();

        var existingEntity = GetEntity(entity.Id);
        if (existingEntity != null)
        {
            DeleteEntityOnly(entity.Id);
        }

        entity = base.WriteEntity(entity);

        if (entity.BoxId != null && entity.BoxSlot != null)
        {
            if (!entitiesByBox.TryGetValue((int)entity.BoxId, out var boxEntities))
            {
                boxEntities = [];
                entitiesByBox.Add((int)entity.BoxId, boxEntities);
            }
            if (!boxEntities.TryGetValue((int)entity.BoxSlot, out var slotEntities))
            {
                slotEntities = [];
                boxEntities.Add((int)entity.BoxSlot, slotEntities);
            }
            slotEntities.Add(entity.Id, entity);
        }

        if (
            entity.AttachedSaveId != null
            && entity.AttachedSavePkmIdBase != null
        )
        {
            var saveId = (uint)entity.AttachedSaveId;
            var savePkmIdBase = entity.AttachedSavePkmIdBase;

            if (!entitiesBySave.TryGetValue(saveId, out var saveEntities))
            {
                saveEntities = [];
                entitiesBySave.Add(saveId, saveEntities);
            }
            saveEntities.Add(savePkmIdBase, entity);
        }

        return entity;
    }

    private void SetupEntities()
    {
        if (!NeedUpdate)
        {
            return;
        }

        entitiesById = base.GetAllEntities();
        entitiesByBox = [];
        entitiesBySave = [];

        entitiesById.Values.ToList().ForEach(entity =>
        {
            if (entity.BoxId != null && entity.BoxSlot != null)
            {
                if (!entitiesByBox.TryGetValue((int)entity.BoxId, out var boxEntities))
                {
                    boxEntities = [];
                    entitiesByBox.Add((int)entity.BoxId, boxEntities);
                }
                if (!boxEntities.TryGetValue((int)entity.BoxSlot, out var slotEntities))
                {
                    slotEntities = [];
                    boxEntities.Add((int)entity.BoxSlot, slotEntities);
                }
                slotEntities.Add(entity.Id, entity);
            }

            if (entity.AttachedSaveId != null && entity.AttachedSavePkmIdBase != null)
            {
                var saveId = (uint)entity.AttachedSaveId;
                var savePkmIdBase = entity.AttachedSavePkmIdBase;

                if (!entitiesBySave.TryGetValue(saveId, out var saveEntities))
                {
                    saveEntities = [];
                    entitiesBySave.Add(saveId, saveEntities);
                }
                saveEntities.Add(savePkmIdBase, entity);
            }
        });

        NeedUpdate = false;
    }

    public PkmVersionEntity WriteEntity(PkmVersionEntity entity, ImmutablePKM pkm)
    {
        WriteEntity(entity);

        pkmFileLoader.WriteEntity(pkm, entity.Filepath, evolves);

        return entity;
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

    public static string GetEntityByBoxKey(int box, int boxSlot) => box + "." + boxSlot;

    private void AssertIsNotLegacy(PkmVersionEntity entity)
    {
        if (
            entity.BoxId == null
            || entity.BoxSlot == null
            || entity.IsMain == null
        )
        {
            throw new InvalidOperationException($"Legacy PkmVersionEntity => {entity.Id}");
        }
    }
}
