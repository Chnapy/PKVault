using System.Collections.Immutable;
using Microsoft.EntityFrameworkCore;

public interface IPkmVersionLoader : IEntityLoader<PkmVersionDTO, PkmVersionEntity>
{
    public IPKMLoader pkmFileLoader { get; }

    public Task<PkmVersionDTO> CreateDTO(PkmVersionEntity entity, ImmutablePKM pkm);
    public Task<PkmVersionEntity> WriteEntity(PkmVersionEntity entity, ImmutablePKM pkm);
    public ImmutableDictionary<int, ImmutableDictionary<string, PkmVersionEntity>> GetEntitiesByBox(int boxId);
    public ImmutableDictionary<int, ImmutableDictionary<string, PkmVersionEntity>> GetEntitiesByBox(string boxId);
    public ImmutableDictionary<string, PkmVersionEntity> GetEntitiesByBox(int boxId, int boxSlot);
    public ImmutableDictionary<string, PkmVersionEntity> GetEntitiesByBox(string boxId, int boxSlot);
    public ImmutableDictionary<string, PkmVersionEntity> GetEntitiesBySave(uint saveId);
    public PkmVersionEntity? GetEntityBySave(uint saveId, string savePkmIdBase);
    public ImmutablePKM GetPkmVersionEntityPkm(PkmVersionEntity entity);
    public Dictionary<string, (byte[] Data, PKMLoadError? Error)> GetAllPKMFiles();
}

public class PkmVersionLoader : EntityLoader<PkmVersionDTO, PkmVersionEntity>, IPkmVersionLoader
{
    private StaticDataService staticDataService;
    private readonly string appPath;
    private readonly string language;

    public IPKMLoader pkmFileLoader { get; }

    private readonly VersionChecker versionChecker = new();

    public PkmVersionLoader(
        IFileIOService fileIOService,
        ISettingsService settingsService,
        SessionDbContext db,
        StaticDataService _staticDataService
    ) : base(
        fileIOService, db, db.PkmVersionsFlags
    )
    {
        staticDataService = _staticDataService;

        var settings = settingsService.GetSettings();

        appPath = settings.AppDirectory;
        language = settings.GetSafeLanguage();

        pkmFileLoader = new PKMLoader(fileIOService, settings.SettingsMutable.STORAGE_PATH);
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

    public ImmutableDictionary<int, ImmutableDictionary<string, PkmVersionEntity>> GetEntitiesByBox(int boxId)
    {
        return GetEntitiesByBox(boxId.ToString());
    }

    public ImmutableDictionary<int, ImmutableDictionary<string, PkmVersionEntity>> GetEntitiesByBox(string boxId)
    {
        return GetDbSet().Where(p => p.BoxId == boxId)
            .GroupBy(p => p.BoxSlot)
            .ToImmutableDictionary(
                p => p.First().BoxSlot,
                p => p.ToImmutableDictionary(p => p.Id)
            );
    }

    public ImmutableDictionary<string, PkmVersionEntity> GetEntitiesByBox(int boxId, int boxSlot)
    {
        return GetEntitiesByBox(boxId.ToString(), boxSlot);
    }

    public ImmutableDictionary<string, PkmVersionEntity> GetEntitiesByBox(string boxId, int boxSlot)
    {
        return GetDbSet().Where(p => p.BoxId == boxId && p.BoxSlot == boxSlot)
            .ToImmutableDictionary(p => p.Id);
    }

    public ImmutableDictionary<string, PkmVersionEntity> GetEntitiesBySave(uint saveId)
    {
        return GetDbSet().Where(p => p.AttachedSaveId == saveId)
            .ToImmutableDictionary(p => p.AttachedSavePkmIdBase!);
    }

    public PkmVersionEntity? GetEntityBySave(uint saveId, string savePkmIdBase)
    {
        return GetDbSet().Where(p => p.AttachedSaveId == saveId && p.AttachedSavePkmIdBase == savePkmIdBase)
            .First();
    }

    public override bool DeleteEntity(string id)
    {
        var entityToRemove = GetEntity(id);
        if (entityToRemove == null)
        {
            return false;
        }

        var result = base.DeleteEntity(id);

        pkmFileLoader.DeleteEntity(entityToRemove.Filepath);

        return result;
    }

    public async Task<PkmVersionEntity> WriteEntity(PkmVersionEntity entity, ImmutablePKM pkm)
    {
        WriteEntity(entity);

        var staticData = await staticDataService.GetStaticData();

        pkmFileLoader.WriteEntity(pkm, entity.Filepath, staticData.Evolves);

        return entity;
    }

    protected override async Task<PkmVersionDTO> GetDTOFromEntity(PkmVersionEntity entity)
    {
        var pkm = GetPkmVersionEntityPkm(entity);

        return await CreateDTO(entity, pkm);
    }

    public ImmutablePKM GetPkmVersionEntityPkm(PkmVersionEntity entity)
    {
        return pkmFileLoader.CreatePKM(entity);
    }

    public Dictionary<string, (byte[] Data, PKMLoadError? Error)> GetAllPKMFiles()
    {
        return GetAllEntities().Values.ToDictionary(
            pv => pv.Filepath,
            pv => pkmFileLoader.GetEntity(pv.Filepath)
        );
    }

    protected override DbSet<PkmVersionEntity> GetDbSet() => db.PkmVersions;

    public static string GetEntityByBoxKey(int box, int boxSlot) => box + "." + boxSlot;
}
