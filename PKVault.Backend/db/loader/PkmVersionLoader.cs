using System.Collections.Immutable;
using Microsoft.EntityFrameworkCore;

public interface IPkmVersionLoader : IEntityLoader<PkmVersionDTO, PkmVersionEntity>
{
    public Task<PkmVersionDTO> CreateDTO(PkmVersionEntity entity, ImmutablePKM pkm);
    public Task<PkmVersionEntity> WriteEntity(PkmVersionEntity entity, ImmutablePKM pkm);
    public Task<ImmutableDictionary<int, ImmutableDictionary<string, PkmVersionEntity>>> GetEntitiesByBox(int boxId);
    public Task<ImmutableDictionary<int, ImmutableDictionary<string, PkmVersionEntity>>> GetEntitiesByBox(string boxId);
    public Task<ImmutableDictionary<string, PkmVersionEntity>> GetEntitiesByBox(int boxId, int boxSlot);
    public Task<ImmutableDictionary<string, PkmVersionEntity>> GetEntitiesByBox(string boxId, int boxSlot);
    public Task<ImmutableDictionary<string, PkmVersionEntity>> GetEntitiesBySave(uint saveId);
    public Task<PkmVersionEntity?> GetEntityBySave(uint saveId, string savePkmIdBase);
    public Task<ImmutablePKM> GetPkmVersionEntityPkm(PkmVersionEntity entity);
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

    public async Task<PkmVersionDTO> CreateDTO(PkmVersionEntity entity, ImmutablePKM pkm)
    {
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

    public async Task<ImmutableDictionary<int, ImmutableDictionary<string, PkmVersionEntity>>> GetEntitiesByBox(int boxId)
    {
        return await GetEntitiesByBox(boxId.ToString());
    }

    public async Task<ImmutableDictionary<int, ImmutableDictionary<string, PkmVersionEntity>>> GetEntitiesByBox(string boxId)
    {
        var dbSet = await GetDbSet();

        return dbSet.Where(p => p.BoxId == boxId)
            .GroupBy(p => p.BoxSlot)
            .ToImmutableDictionary(
                p => p.First().BoxSlot,
                p => p.ToImmutableDictionary(p => p.Id)
            );
    }

    public async Task<ImmutableDictionary<string, PkmVersionEntity>> GetEntitiesByBox(int boxId, int boxSlot)
    {
        return await GetEntitiesByBox(boxId.ToString(), boxSlot);
    }

    public async Task<ImmutableDictionary<string, PkmVersionEntity>> GetEntitiesByBox(string boxId, int boxSlot)
    {
        var dbSet = await GetDbSet();

        return dbSet.Where(p => p.BoxId == boxId && p.BoxSlot == boxSlot)
            .ToImmutableDictionary(p => p.Id);
    }

    public async Task<ImmutableDictionary<string, PkmVersionEntity>> GetEntitiesBySave(uint saveId)
    {
        var dbSet = await GetDbSet();

        return dbSet.Where(p => p.AttachedSaveId == saveId)
            .ToImmutableDictionary(p => p.AttachedSavePkmIdBase!);
    }

    public async Task<PkmVersionEntity?> GetEntityBySave(uint saveId, string savePkmIdBase)
    {
        var dbSet = await GetDbSet();

        return dbSet.Where(p => p.AttachedSaveId == saveId && p.AttachedSavePkmIdBase == savePkmIdBase)
            .First();
    }

    public override async Task<bool> DeleteEntity(string id)
    {
        var entityToRemove = await GetEntity(id);
        if (entityToRemove == null)
        {
            return false;
        }

        var result = await base.DeleteEntity(id);

        await pkmFileLoader.DeleteEntity(entityToRemove.Filepath);

        return result;
    }

    public async Task<PkmVersionEntity> WriteEntity(PkmVersionEntity entity, ImmutablePKM pkm)
    {
        await WriteEntity(entity);

        var staticData = await staticDataService.GetStaticData();

        await pkmFileLoader.WriteEntity(pkm, entity.Filepath, staticData.Evolves);

        return entity;
    }

    protected override async Task<PkmVersionDTO> GetDTOFromEntity(PkmVersionEntity entity)
    {
        var pkm = await GetPkmVersionEntityPkm(entity);

        return await CreateDTO(entity, pkm);
    }

    public async Task<ImmutablePKM> GetPkmVersionEntityPkm(PkmVersionEntity entity)
    {
        return await pkmFileLoader.CreatePKM(entity);
    }

    protected override DbSet<PkmVersionEntity> GetDbSetRaw() => db.PkmVersions;

    public static string GetEntityByBoxKey(int box, int boxSlot) => box + "." + boxSlot;
}
