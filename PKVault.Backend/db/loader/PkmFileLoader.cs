
using Microsoft.EntityFrameworkCore;
using PKHeX.Core;

public interface IPkmFileLoader
{
    public void ClearData();

    public PkmFileEntity? GetEntity(string filepath);
    public List<PkmFileEntity> GetAllEntities();
    public void DeleteEntity(string filepath);
    public void WriteEntity(ImmutablePKM pkm, string filepath, Dictionary<ushort, StaticEvolve> evolves);
    public void WriteToFiles();
    public ImmutablePKM CreatePKM(string id, string filepath, byte generation);
    public ImmutablePKM CreatePKM(PkmVersionEntity pkmVersionEntity);
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
    private string storagePath;
    private SessionDbContext db;

    public PkmFileLoader(
        IFileIOService _fileIOService,
        ISettingsService settingsService,
        SessionDbContext _db
    )
    {
        fileIOService = _fileIOService;
        storagePath = settingsService.GetSettings().SettingsMutable.STORAGE_PATH;
        db = _db;
    }

    public PkmFileEntity? GetEntity(string filepath)
    {
        db.ChangeTracker.Clear();
        var entity = GetDbSet().Find(filepath);
        if (entity != null && entity.Deleted)
        {
            return null;
        }
        return entity;
    }

    public List<PkmFileEntity> GetAllEntities()
    {
        db.ChangeTracker.Clear();
        return [.. GetDbSet().AsNoTracking()];
    }

    public void DeleteEntity(string filepath)
    {
        if (EnableLog)
            Console.WriteLine($"(M) Delete PKM file filepath={filepath}");

        db.ChangeTracker.Clear();
        GetDbSet()
            .Update(new(
                Filepath: filepath,
                Data: [],
                Error: null,
                Updated: false,
                Deleted: true
            ));
        db.SaveChanges();
    }

    public void WriteEntity(ImmutablePKM pkm, string filepath, Dictionary<ushort, StaticEvolve> evolves)
    {
        if (!pkm.IsEnabled)
        {
            throw new InvalidOperationException($"Write disabled PKM not allowed");
        }

        var bytes = GetPKMBytes(pkm);

        if (EnableLog)
            Console.WriteLine($"(M) PKM-file Write idBase={pkm.GetPKMIdBase(evolves)} filepath={filepath} bytes.length={bytes.Length}");

        var entity = new PkmFileEntity(
            Filepath: filepath,
            Data: bytes,
            Error: null,
            Updated: true,
            Deleted: false
        );

        if (GetEntity(entity.Filepath) != null)
        {
            db.ChangeTracker.Clear();
            GetDbSet().Update(entity);
        }
        else
        {
            db.ChangeTracker.Clear();
            GetDbSet().Add(entity);
        }
        db.SaveChanges();
    }

    public void WriteToFiles()
    {
        db.ChangeTracker.Clear();
        GetDbSet()
            .AsNoTracking()
            .Where(pkmFile => pkmFile.Deleted)
            .ToList()
            .ForEach(pkmFileToDelete =>
            {
                fileIOService.Delete(pkmFileToDelete.Filepath);
            });

        db.ChangeTracker.Clear();
        GetDbSet()
            .AsNoTracking()
            .Where(pkmFile => pkmFile.Updated && !pkmFile.Deleted)
            .ToList()
            .ForEach(pkmFileToUpdate =>
            {
                fileIOService.WriteBytes(pkmFileToUpdate.Filepath, pkmFileToUpdate.Data);
            });
    }

    public void ClearData()
    {
        db.ChangeTracker.Clear();
        // clear db
        GetDbSet().ExecuteDelete();
        db.SaveChanges();
    }

    public ImmutablePKM CreatePKM(PkmVersionEntity pkmVersionEntity)
    {
        return CreatePKM(
            pkmVersionEntity.Id, pkmVersionEntity.Filepath, pkmVersionEntity.Generation
        );
    }

    public ImmutablePKM CreatePKM(string id, string filepath, byte generation)
    {
        var entity = GetEntity(filepath);
        ArgumentNullException.ThrowIfNull(entity);

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
            Console.Error.WriteLine($"PKM file load failure with PkmVersion.Id={id} path=${filepath}");
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

    protected DbSet<PkmFileEntity> GetDbSet() => db.PkmFiles;
}

public class PKMLoadException(PKMLoadError error) : IOException($"PKM load error occured: {error}")
{
    public readonly PKMLoadError Error = error;
}
