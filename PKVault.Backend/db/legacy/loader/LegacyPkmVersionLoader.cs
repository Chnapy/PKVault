using System.Collections.Immutable;

public class LegacyPkmVersionLoader : LegacyEntityLoader<LegacyPkmVersionEntity>
{
    public static string GetFilepath(string dbPath) => MatcherUtil.NormalizePath(Path.Combine(dbPath, "pkm-version.json"));

    private readonly Dictionary<ushort, StaticEvolve> evolves;

    public IPKMLoader pkmFileLoader { get; }

    // boxId => boxSlot => LegacyPkmVersionEntity.Id => LegacyPkmVersionEntity
    private Dictionary<int, Dictionary<int, Dictionary<string, LegacyPkmVersionEntity>>> entitiesByBox = [];

    // saveId => attachedSavePkmIdBase => LegacyPkmVersionEntity
    private Dictionary<uint, Dictionary<string, LegacyPkmVersionEntity>> entitiesBySave = [];

    private bool NeedUpdate = true;

    public LegacyPkmVersionLoader(
        IFileIOService fileIOService,
        string dbPath,
        string storagePath,
        Dictionary<ushort, StaticEvolve> _evolves
    ) : base(
        fileIOService,
        filePath: GetFilepath(dbPath),
        dictJsonContext: LegacyEntityJsonContext.Default.DictionaryStringLegacyPkmVersionEntity
    )
    {
        evolves = _evolves;
        pkmFileLoader = new PKMLoader(fileIOService, storagePath);
    }

    public ImmutableDictionary<int, ImmutableDictionary<string, LegacyPkmVersionEntity>> GetEntitiesByBox(int boxId)
    {
        SetupEntities();

        return entitiesByBox.TryGetValue(boxId, out var boxEntities)
            ? boxEntities.ToImmutableDictionary(
                entry => entry.Key,
                entry => entry.Value.ToImmutableDictionary()
            )
            : [];
    }

    public ImmutableDictionary<string, LegacyPkmVersionEntity> GetEntitiesByBox(int boxId, int boxSlot)
    {
        SetupEntities();

        return entitiesByBox.TryGetValue(boxId, out var boxEntities) && boxEntities.TryGetValue(boxSlot, out var entities)
            ? entities.ToImmutableDictionary()
            : [];
    }

    public ImmutableDictionary<string, LegacyPkmVersionEntity> GetEntitiesBySave(uint saveId)
    {
        SetupEntities();

        return entitiesBySave.TryGetValue(saveId, out var entities)
            ? entities.ToImmutableDictionary()
            : [];
    }

    public LegacyPkmVersionEntity? GetEntityBySave(uint saveId, string savePkmIdBase)
    {
        return GetEntitiesBySave(saveId).TryGetValue(savePkmIdBase, out var entity) ? entity : null;
    }

    public override Dictionary<string, LegacyPkmVersionEntity> GetAllEntities()
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

        var saveId = entityToRemove.AttachedSaveId ?? 0;
        var savePkmIdBase = entityToRemove.AttachedSavePkmIdBase ?? "";

        var result = base.DeleteEntity(id);

        if (entitiesByBox.TryGetValue(entityToRemove.BoxId, out var boxEntities)
            && boxEntities.TryGetValue(entityToRemove.BoxSlot, out var slotEntities))
        {
            slotEntities.Remove(id);
        }

        if (entitiesBySave.TryGetValue(saveId, out var saveEntities))
        {
            saveEntities.Remove(savePkmIdBase);
        }

        return result;
    }

    public override LegacyPkmVersionEntity WriteEntity(LegacyPkmVersionEntity entity)
    {
        SetupEntities();

        var existingEntity = GetEntity(entity.Id);
        if (existingEntity != null)
        {
            DeleteEntityOnly(entity.Id);
        }

        entity = base.WriteEntity(entity);

        if (!entitiesByBox.TryGetValue(entity.BoxId, out var boxEntities))
        {
            boxEntities = [];
            entitiesByBox.Add(entity.BoxId, boxEntities);
        }
        if (!boxEntities.TryGetValue(entity.BoxSlot, out var slotEntities))
        {
            slotEntities = [];
            boxEntities.Add(entity.BoxSlot, slotEntities);
        }
        slotEntities.Add(entity.Id, entity);

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
            if (!entitiesByBox.TryGetValue(entity.BoxId, out var boxEntities))
            {
                boxEntities = [];
                entitiesByBox.Add(entity.BoxId, boxEntities);
            }
            if (!boxEntities.TryGetValue(entity.BoxSlot, out var slotEntities))
            {
                slotEntities = [];
                boxEntities.Add(entity.BoxSlot, slotEntities);
            }
            slotEntities.Add(entity.Id, entity);

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

    public LegacyPkmVersionEntity WriteEntity(LegacyPkmVersionEntity entity, ImmutablePKM pkm)
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

    public ImmutablePKM GetPkmVersionEntityPkm(LegacyPkmVersionEntity entity)
    {
        return pkmFileLoader.CreatePKM(entity.Id, entity.Filepath, entity.Generation);
    }

    public override int GetLastSchemaVersion() => 1;

    public static string GetEntityByBoxKey(int box, int boxSlot) => box + "." + boxSlot;
}
