
using Microsoft.EntityFrameworkCore;
using PKHeX.Core;

public interface IPkmFileLoader
{
    public Task<PkmFileEntity> PrepareEntity(ImmutablePKM pkm, string filepath, bool updated = true, bool checkPkm = true);
    public Task<List<string>> GetEnabledFilepaths();
    public Task WriteToFiles();
    public ImmutablePKM CreatePKM(PkmFileEntity entity, EntityContext context);
    public byte[] GetPKMBytes(ImmutablePKM pkm);
    public string GetPKMFilepath(ImmutablePKM pkm, Dictionary<ushort, StaticEvolve> evolves);
}

public class PkmFileLoader : IPkmFileLoader
{
    private static string GetPKMFilename(ImmutablePKM pkm, Dictionary<ushort, StaticEvolve> evolves)
    {
        var star = pkm.IsShiny ? " ★" : string.Empty;
        var speciesName = GameInfo.Strings.Species[pkm.Species].ToUpperInvariant().Replace(":", "");
        var id = pkm.GetPKMIdBase(evolves);
        return $"{pkm.Species:0000}{star} - {speciesName} - {id}.{pkm.Extension}";
    }

    public static async Task<PkmFileEntity> LoadPkmFile(IFileIOService fileIOService, PkmFileEntity pkmFile, bool checkBeforeLoad)
    {
        var filepath = Path.Combine(SettingsService.GetAppDirectory(), pkmFile.Filepath);

        try
        {
            bool TooSmall, TooBig;

            // useful if we may expect big slow files
            // downside: specific file access
            if (checkBeforeLoad)
            {
                (TooSmall, TooBig) = fileIOService.CheckGameFile(filepath);

                if (TooBig)
                    throw new PKMLoadException(PKMLoadError.TOO_BIG, filepath);

                if (TooSmall)
                    throw new PKMLoadException(PKMLoadError.TOO_SMALL, filepath);
            }

            pkmFile.Data = await fileIOService.ReadBytes(filepath);
            pkmFile.Error = null;
            
            // optimistic check, to avoid multiple file access
            (TooSmall, TooBig) = fileIOService.CheckGameFile(pkmFile.Data.Length);

            if (TooBig)
                throw new PKMLoadException(PKMLoadError.TOO_BIG, filepath);

            if (TooSmall)
                throw new PKMLoadException(PKMLoadError.TOO_SMALL, filepath);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine(ex);

            pkmFile.Data = [];
            pkmFile.Error = GetPKMLoadError(ex);
        }

        pkmFile.Updated = false;
        pkmFile.Deleted = false;

        return pkmFile;
    }

    public bool EnableLog = true;

    private ILogger<PkmFileLoader> log;
    private IFileIOService fileIOService;
    private ISessionServiceMinimal sessionService;
    private string storagePath;
    private SessionDbContext db;

    public PkmFileLoader(
        ILogger<PkmFileLoader> _log,
        IFileIOService _fileIOService,
        ISessionServiceMinimal _sessionService,
        ISettingsService settingsService,
        SessionDbContext _db
    )
    {
        log = _log;
        fileIOService = _fileIOService;
        sessionService = _sessionService;
        storagePath = settingsService.GetSettings().SettingsMutable.STORAGE_PATH;
        db = _db;
    }

    public async Task<List<string>> GetEnabledFilepaths()
    {
        var dbSet = await GetDbSet();

        return await dbSet
            .AsNoTracking()
            .Where(p => p.Error == null)
            .Select(p => p.Filepath)
            .ToListAsync();
    }

    public async Task<PkmFileEntity> PrepareEntity(ImmutablePKM pkm, string filepath, bool updated = true, bool checkPkm = true)
    {
        if (checkPkm && !pkm.IsEnabled)
        {
            throw new InvalidOperationException($"Write disabled PKM not allowed");
        }

        var data = pkm.IsEnabled
            ? GetPKMBytes(pkm)
            : [];
        var error = pkm.LoadError;

        var entity = new PkmFileEntity()
        {
            Filepath = filepath,
            Data = data,
            Error = error,
            Updated = updated,
            Deleted = false
        };

        await AttachEntity(entity);

        return entity;
    }

    private async Task AttachEntity(PkmFileEntity entity)
    {
        var dbSet = await GetDbSet();

        var exists = await dbSet.AnyAsync(e => e.Filepath == entity.Filepath);

        db.PkmFiles.Attach(entity);
        db.Entry(entity).State = exists
            ? EntityState.Modified
            : EntityState.Added;
    }

    public async Task WriteToFiles()
    {
        var dbSet = await GetDbSet();

        using var _ = log.Time($"PkmFileLoader.WriteToFiles");

        var pkmFilesToDelete = await dbSet
            // .AsNoTracking()
            .Where(pkmFile => pkmFile.Deleted)
            .ToListAsync();

        log.LogDebug($"Pkm files to delete: {pkmFilesToDelete.Count}");

        pkmFilesToDelete.ForEach(pkmFileToDelete =>
        {
            var filepath = Path.Combine(SettingsService.GetAppDirectory(), pkmFileToDelete.Filepath);
            fileIOService.Delete(filepath);
        });

        var pkmFilesToUpdate = await dbSet
            .AsNoTracking()
            .Where(pkmFile => pkmFile.Updated && !pkmFile.Deleted)
            .ToListAsync();

        log.LogDebug($"Pkm files to update: {pkmFilesToUpdate.Count}");

        pkmFilesToUpdate.ForEach(pkmFileToUpdate =>
        {
            var filepath = Path.Combine(SettingsService.GetAppDirectory(), pkmFileToUpdate.Filepath);
            fileIOService.WriteBytes(filepath, pkmFileToUpdate.Data);
        });

        dbSet.RemoveRange(pkmFilesToDelete);
        await db.SaveChangesAsync();

        await dbSet.ExecuteUpdateAsync(setters => setters
            .SetProperty(e => e.Data, [])
            .SetProperty(e => e.Error, PKMLoadError.NOT_LOADED)
            .SetProperty(e => e.Updated, false)
            .SetProperty(e => e.Deleted, false)
        );
    }

    public ImmutablePKM CreatePKM(PkmFileEntity entity, EntityContext context)
    {
        var filepath = entity.Filepath;

        if (entity.Error != null)
        {
            return new(GetPlaceholderPKM(), entity.Error);
        }

        var loadError = entity.Error;
        PKM pkm;
        try
        {
            var ext = Path.GetExtension(filepath.AsSpan());

            FileUtil.TryGetPKM(entity.Data, out var pk, ext, new SimpleTrainerInfo() { Context = context });
            if (pk == null)
            {
                throw new Exception($"TryGetPKM gives null pkm, path={filepath} bytes.length={entity.Data.Length}");
            }
            pkm = pk;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"PKM file load failure with PkmFileEntity.Filepath=${filepath}");
            Console.Error.WriteLine(ex);

            pkm = GetPlaceholderPKM();
            loadError = GetPKMLoadError(ex);
        }

        return new(pkm, loadError);
    }

    public byte[] GetPKMBytes(ImmutablePKM pkm)
    {
        return pkm.GetDecryptedDataParty();
    }

    private PKM GetPlaceholderPKM()
    {
        // class used here doesn't matter
        // since this pkm should not be manipulated nor stored at all
        return new PK1
        {
            Species = 0,
            Form = 0,
            Gender = 0
        };
    }

    public static PKMLoadError GetPKMLoadError(Exception ex) => ex switch
    {
        FileNotFoundException => PKMLoadError.NOT_FOUND,
        DirectoryNotFoundException => PKMLoadError.NOT_FOUND,
        UnauthorizedAccessException => PKMLoadError.UNAUTHORIZED,
        PKMLoadException pkmEx => pkmEx.Error,
        _ => PKMLoadError.UNKNOWN
    };

    public string GetPKMFilepath(ImmutablePKM pkm, Dictionary<ushort, StaticEvolve> evolves)
    {
        if (!pkm.IsEnabled)
        {
            throw new InvalidOperationException($"Get filepath from disabled PKM not allowed");
        }

        var generationName = pkm.Context.ToString()[3..];

        return MatcherUtil.NormalizePath(Path.Combine(
            storagePath,
            generationName,
            GetPKMFilename(pkm, evolves)
        ));
    }

    protected async Task<DbSet<PkmFileEntity>> GetDbSet()
    {
        await sessionService.EnsureSessionCreated(db.ContextId.InstanceId);

        return db.PkmFiles;
    }
}

public class PKMLoadException(PKMLoadError error, string path) : IOException($"PKM load error occured: {error} for path: {path}")
{
    public readonly PKMLoadError Error = error;
}
