using Microsoft.EntityFrameworkCore;
using PKHeX.Core;

public interface IPkmVersionLoader : IEntityLoader<PkmVersionDTO, PkmVersionEntity>
{
    public Task<PkmVersionDTO> CreateDTO(PkmVersionEntity entity);
    public Task<PkmVersionEntity> AddEntity(PkmVersionEntity entity, ImmutablePKM pkm);
    public Task UpdateEntity(PkmVersionEntity entity, ImmutablePKM pkm);

    public Task<Dictionary<int, Dictionary<string, PkmVersionEntity>>> GetEntitiesByBox(int boxId);
    public Task<Dictionary<int, Dictionary<string, PkmVersionEntity>>> GetEntitiesByBox(string boxId);
    public Task<Dictionary<string, PkmVersionEntity>> GetEntitiesByBox(int boxId, int boxSlot);
    public Task<Dictionary<string, PkmVersionEntity>> GetEntitiesByBox(string boxId, int boxSlot);
    public Task<Dictionary<string, PkmVersionEntity>> GetEntitiesBySave(uint saveId);
    public Task<Dictionary<uint, List<PkmVersionEntity>>> GetEntitiesAttachedGroupedBySave();
    public Task<Dictionary<string, PkmVersionEntity>> GetEntitiesAttached();
    public Task<PkmVersionEntity?> GetEntityBySave(uint saveId, string savePkmIdBase);
    public Task<bool> HasEntityByForm(ushort species, byte form, Gender gender);
    public Task<bool> HasEntityByFormShiny(ushort species, byte form, Gender gender);
    public Task<ImmutablePKM> GetPKM(PkmVersionEntity entity);
}

public class PkmVersionLoader : EntityLoader<PkmVersionDTO, PkmVersionEntity>, IPkmVersionLoader
{
    private StaticDataService staticDataService;
    private IPkmFileLoader pkmFileLoader;
    private readonly string appPath;
    private readonly string language;

    private readonly VersionChecker versionChecker = new();

    public PkmVersionLoader(
        IFileIOService fileIOService,
        SessionService sessionService,
        ISettingsService settingsService,
        IPkmFileLoader _pkmFileLoader,
        SessionDbContext db,
        StaticDataService _staticDataService
    ) : base(
        fileIOService, sessionService, db, db.PkmVersionsFlags
    )
    {
        staticDataService = _staticDataService;
        pkmFileLoader = _pkmFileLoader;

        var settings = settingsService.GetSettings();

        appPath = settings.AppDirectory;
        language = settings.GetSafeLanguage();
    }

    public async Task<PkmVersionDTO> CreateDTO(PkmVersionEntity entity)
    {
        var pkm = await GetPKM(entity);

        var staticData = await staticDataService.GetStaticData();

        var filepathAbsolute = Path.Combine(appPath, entity.Filepath);
        var isFilePresent = fileIOService.Exists(filepathAbsolute);

        var dto = new PkmVersionDTO(
            Id: entity.Id,
            Generation: entity.Generation,
            SettingsLanguage: language,
            Pkm: pkm,

            BoxId: int.Parse(entity.BoxId),
            BoxSlot: entity.BoxSlot,
            IsMain: entity.IsMain,
            AttachedSaveId: entity.AttachedSaveId,
            AttachedSavePkmIdBase: entity.AttachedSavePkmIdBase,

            IsFilePresent: isFilePresent,
            Filepath: entity.Filepath,
            FilepathAbsolute: filepathAbsolute,

            VersionChecker: versionChecker,
            Evolves: staticData.Evolves
        );

        return dto;
    }

    public override async Task<PkmVersionEntity?> GetEntity(string id)
    {
        var dbSet = await GetDbSet();

        using var _ = LogUtil.Time($"{typeof(PkmVersionEntity)} - GetEntity");

        return await dbSet
            .Include(p => p.PkmFile)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public override async Task<Dictionary<string, PkmVersionEntity>> GetAllEntities()
    {
        var dbSet = await GetDbSet();

        using var _ = LogUtil.Time($"{typeof(PkmVersionEntity)} - GetAllEntities");

        return await dbSet
            .Include(p => p.PkmFile)
            .ToDictionaryAsync(p => p.Id);
    }

    public override async Task<Dictionary<string, PkmVersionEntity?>> GetEntitiesByIds(string[] ids)
    {
        var dbSet = await GetDbSet();

        using var _ = LogUtil.Time($"{typeof(PkmVersionEntity)} - GetEntitiesByIds");

        var found = await dbSet
            .Where(p => ids.Contains(p.Id))
            .Include(p => p.PkmFile)
            .ToDictionaryAsync(p => p.Id);

        var result = new Dictionary<string, PkmVersionEntity?>(ids.Length);
        foreach (var id in ids)
        {
            found.TryGetValue(id, out var entity);
            result[id] = entity;
        }

        return result;
    }

    public async Task<Dictionary<int, Dictionary<string, PkmVersionEntity>>> GetEntitiesByBox(int boxId)
    {
        return await GetEntitiesByBox(boxId.ToString());
    }

    public async Task<Dictionary<int, Dictionary<string, PkmVersionEntity>>> GetEntitiesByBox(string boxId)
    {
        var dbSet = await GetDbSet();

        using var _ = LogUtil.Time($"{typeof(PkmVersionEntity)} - GetEntitiesByBox");

        return await dbSet.Where(p => p.BoxId == boxId)
            .Include(p => p.PkmFile)
            .GroupBy(p => p.BoxSlot)
            .ToDictionaryAsync(
                p => p.First().BoxSlot,
                p => p.ToDictionary(p => p.Id)
            );
    }

    public async Task<Dictionary<string, PkmVersionEntity>> GetEntitiesByBox(int boxId, int boxSlot)
    {
        return await GetEntitiesByBox(boxId.ToString(), boxSlot);
    }

    public async Task<Dictionary<string, PkmVersionEntity>> GetEntitiesByBox(string boxId, int boxSlot)
    {
        var dbSet = await GetDbSet();

        using var _ = LogUtil.Time($"{typeof(PkmVersionEntity)} - GetEntitiesByBox + Slot");

        return await dbSet.Where(p => p.BoxId == boxId && p.BoxSlot == boxSlot)
            .Include(p => p.PkmFile)
            .ToDictionaryAsync(p => p.Id);
    }

    public async Task<Dictionary<string, PkmVersionEntity>> GetEntitiesBySave(uint saveId)
    {
        var dbSet = await GetDbSet();

        using var _ = LogUtil.Time($"{typeof(PkmVersionEntity)} - GetEntitiesBySave");

        return await dbSet.Where(p => p.AttachedSaveId == saveId)
            .Include(p => p.PkmFile)
            .ToDictionaryAsync(p => p.AttachedSavePkmIdBase!);
    }

    public async Task<PkmVersionEntity?> GetEntityBySave(uint saveId, string savePkmIdBase)
    {
        var dbSet = await GetDbSet();

        using var _ = LogUtil.Time($"{typeof(PkmVersionEntity)} - GetEntityBySave");

        return await dbSet.Where(p => p.AttachedSaveId == saveId && p.AttachedSavePkmIdBase == savePkmIdBase)
            .Include(p => p.PkmFile)
            .FirstOrDefaultAsync();
    }

    public async Task<Dictionary<uint, List<PkmVersionEntity>>> GetEntitiesAttachedGroupedBySave()
    {
        var dbSet = await GetDbSet();

        using var _ = LogUtil.Time($"{typeof(PkmVersionEntity)} - GetEntitiesAttachedGroupedBySave");

        return await dbSet.Where(p => p.AttachedSaveId != null)
            .Include(p => p.PkmFile)
            .GroupBy(p => (uint)p.AttachedSaveId!)
            .ToDictionaryAsync(g => g.Key, g => g.ToList());
    }

    public async Task<Dictionary<string, PkmVersionEntity>> GetEntitiesAttached()
    {
        var dbSet = await GetDbSet();

        using var _ = LogUtil.Time($"{typeof(PkmVersionEntity)} - GetEntitiesAttached");

        return await dbSet.Where(p => p.AttachedSaveId != null)
            .Include(p => p.PkmFile)
            .ToDictionaryAsync(p => p.Id);
    }

    public async Task<bool> HasEntityByForm(ushort species, byte form, Gender gender)
    {
        var dbSet = await GetDbSet();

        // using var _ = LogUtil.Time($"{typeof(PkmVersionEntity)} - HasEntityByForm");

        return await dbSet
            .AnyAsync(p => p.Species == species && p.Form == form && p.Gender == gender);
    }

    public async Task<bool> HasEntityByFormShiny(ushort species, byte form, Gender gender)
    {
        var dbSet = await GetDbSet();

        // using var _ = LogUtil.Time($"{typeof(PkmVersionEntity)} - HasEntityByFormShiny");

        return await dbSet
            .AnyAsync(p => p.Species == species && p.Form == form && p.Gender == gender && p.IsShiny);
    }

    public async Task<PkmVersionEntity> AddEntity(PkmVersionEntity entity, ImmutablePKM pkm)
    {
        if (!pkm.IsEnabled)
        {
            throw new InvalidOperationException($"Cannot add disabled PkmVersion");
        }

        var staticData = await staticDataService.GetStaticData();
        var filepath = pkmFileLoader.GetPKMFilepath(pkm, staticData.Evolves);

        entity.Filepath = filepath;
        entity.PkmFile = await pkmFileLoader.PrepareEntity(pkm, filepath, updated: true, deleted: false);

        entity.Species = pkm.Species;
        entity.Form = pkm.Form;
        entity.Gender = pkm.Gender;
        entity.IsShiny = pkm.IsShiny;

        return await AddEntity(entity);
    }

    public async Task UpdateEntity(PkmVersionEntity entity, ImmutablePKM pkm)
    {
        if (pkm.IsEnabled)
        {
            var staticData = await staticDataService.GetStaticData();
            var filepath = pkmFileLoader.GetPKMFilepath(pkm, staticData.Evolves);

            if (filepath != entity.Filepath)
            {
                entity.Filepath = filepath;
                entity.PkmFile = await pkmFileLoader.PrepareEntity(pkm, entity.Filepath, updated: true, deleted: false);
            }

            entity.Species = pkm.Species;
            entity.Form = pkm.Form;
            entity.Gender = pkm.Gender;
            entity.IsShiny = pkm.IsShiny;
        }

        await UpdateEntity(entity);
    }

    protected override async Task<PkmVersionDTO> GetDTOFromEntity(PkmVersionEntity entity)
    {
        return await CreateDTO(entity);
    }

    protected override DbSet<PkmVersionEntity> GetDbSetRaw() => db.PkmVersions;

    public async Task<ImmutablePKM> GetPKM(PkmVersionEntity entity)
    {
        ArgumentNullException.ThrowIfNull(entity.PkmFile);
        return await pkmFileLoader.CreatePKM(entity.PkmFile, entity.Generation);
    }
}
