
using Microsoft.EntityFrameworkCore;
using PKHeX.Core;

public interface IPkmFileLoader
{
    public Task<PkmFileEntity> PrepareEntity(ImmutablePKM pkm, string filepath, bool updated, bool deleted);
    public Task<List<PkmFileEntity>> GetEnabledEntities();
    public Task WriteToFiles();
    public Task ClearData();
    public Task<ImmutablePKM> CreatePKM(PkmFileEntity entity, byte generation);
    public string GetPKMFilepath(ImmutablePKM pkm, Dictionary<ushort, StaticEvolve> evolves);
}

public class PkmFileLoader : IPkmFileLoader
{
    private static byte[] GetPKMBytes(ImmutablePKM pkm)
    {
        return [.. pkm.DecryptedPartyData];
    }

    private static string GetPKMFilename(ImmutablePKM pkm, Dictionary<ushort, StaticEvolve> evolves)
    {
        var star = pkm.IsShiny ? " ★" : string.Empty;
        var speciesName = GameInfo.Strings.Species[pkm.Species].ToUpperInvariant().Replace(":", "");
        var id = pkm.GetPKMIdBase(evolves);
        return $"{pkm.Species:0000}{star} - {speciesName} - {id}.{pkm.Extension}";
    }

    public bool EnableLog = true;

    private IFileIOService fileIOService;
    private SessionService sessionService;
    private string storagePath;
    private SessionDbContext db;

    public PkmFileLoader(
        IFileIOService _fileIOService,
        SessionService _sessionService,
        ISettingsService settingsService,
        SessionDbContext _db
    )
    {
        fileIOService = _fileIOService;
        sessionService = _sessionService;
        storagePath = settingsService.GetSettings().SettingsMutable.STORAGE_PATH;
        db = _db;
    }

    public async Task<List<PkmFileEntity>> GetEnabledEntities()
    {
        var dbSet = await GetDbSet();

        return await dbSet
            .AsNoTracking()
            .Where(p => p.Error == null)
            .ToListAsync();
    }

    public async Task<PkmFileEntity> PrepareEntity(ImmutablePKM pkm, string filepath, bool updated, bool deleted)
    {
        if (!pkm.IsEnabled)
        {
            throw new InvalidOperationException($"Write disabled PKM not allowed");
        }

        var bytes = GetPKMBytes(pkm);

        return new()
        {
            Filepath = filepath,
            Data = bytes,
            Error = null,
            Updated = true,
            Deleted = false
        };
    }

    public async Task WriteToFiles()
    {
        var dbSet = await GetDbSet();

        var pkmFilesToDelete = await dbSet
            .AsNoTracking()
            .Where(pkmFile => pkmFile.Deleted)
            .ToListAsync();

        pkmFilesToDelete.ForEach(pkmFileToDelete =>
        {
            fileIOService.Delete(pkmFileToDelete.Filepath);
        });

        var pkmFilesToUpdate = await dbSet
            .AsNoTracking()
            .Where(pkmFile => pkmFile.Updated && !pkmFile.Deleted)
            .ToListAsync();

        pkmFilesToUpdate.ForEach(pkmFileToUpdate =>
        {
            fileIOService.WriteBytes(pkmFileToUpdate.Filepath, pkmFileToUpdate.Data);
        });
    }

    public async Task ClearData()
    {
        var dbSet = await GetDbSet();

        // clear db
        await dbSet.ExecuteDeleteAsync();
        await db.SaveChangesAsync();
    }

    public async Task<ImmutablePKM> CreatePKM(PkmFileEntity entity, byte generation)
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

            FileUtil.TryGetPKM(entity.Data, out var pk, ext, new SimpleTrainerInfo() { Context = (EntityContext)generation });
            if (pk == null)
            {
                throw new Exception($"TryGetPKM gives null pkm, path={filepath} bytes.length={entity.Data.Length}");
            }
            pkm = pk;

            // pkm ??= pkmVersionEntity.Generation switch
            // {
            //     1 => new PK1(bytes),
            //     2 => new PK2(bytes),
            //     3 => new PK3(bytes),
            //     4 => new PK4(bytes),
            //     5 => new PK5(bytes),
            //     _ => EntityFormat.GetFromBytes(bytes)!
            // };
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

        return MatcherUtil.NormalizePath(Path.Combine(
            storagePath,
            pkm.Format.ToString(),
            GetPKMFilename(pkm, evolves)
        ));
    }

    protected async Task<DbSet<PkmFileEntity>> GetDbSet()
    {
        await sessionService.EnsureSessionCreated(db.ContextId.InstanceId);

        return db.PkmFiles;
    }
}

public class PKMLoadException(PKMLoadError error) : IOException($"PKM load error occured: {error}")
{
    public readonly PKMLoadError Error = error;
}
