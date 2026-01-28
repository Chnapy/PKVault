using Microsoft.EntityFrameworkCore;

public class DbSeedingService(IFileIOService fileIOService)
{
    public async Task Seed(DbContext db, bool _, CancellationToken cancelToken)
    {
        using var __ = LogUtil.Time("DB seeding");

        await SeedPkmFilesData(db, cancelToken);
    }

    private async Task SeedPkmFilesData(DbContext db, CancellationToken cancelToken)
    {
        var pkmFiles = db.Set<PkmFileEntity>();
        var pkmVersions = db.Set<PkmVersionEntity>();

        var pkmFilesToAdd = (await pkmVersions
            .Where(pkmVersion => pkmVersion.PkmFile == default)
            .ToArrayAsync(cancelToken))
            .Select(e => PkmVersionToPkmFileEntity(e.Filepath));

        if (!pkmFilesToAdd.Any())
        {
            return;
        }

        using var _ = LogUtil.Time("Seed PKM files migration");

        await using var transaction = await db.Database.BeginTransactionAsync(cancelToken);

        try
        {
            await pkmFiles.AddRangeAsync(pkmFilesToAdd, cancelToken);

            await db.SaveChangesAsync(cancelToken);

            await transaction.CommitAsync(cancelToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancelToken);
            throw;
        }
    }

    private PkmFileEntity PkmVersionToPkmFileEntity(string filepath)
    {
        byte[] bytes = [];
        PKMLoadError? error = null;
        try
        {
            var (TooSmall, TooBig) = fileIOService.CheckGameFile(filepath);

            if (TooBig)
                throw new PKMLoadException(PKMLoadError.TOO_BIG);

            if (TooSmall)
                throw new PKMLoadException(PKMLoadError.TOO_SMALL);

            bytes = fileIOService.ReadBytes(filepath);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine(ex);
            error = PkmFileLoader.GetPKMLoadError(ex);
        }

        return new PkmFileEntity()
        {
            Filepath = filepath,
            Data = bytes,
            Error = error,
            Updated = false,
            Deleted = false
        };
    }
}
