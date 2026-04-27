using Microsoft.EntityFrameworkCore;

public interface IDbSeedingService
{
    public Task Seed(DbContext db, bool _, CancellationToken cancelToken);
}

public class DbSeedingService(ILogger<DbSeedingService> log, IFileIOService fileIOService) : IDbSeedingService
{
    public async Task Seed(DbContext db, bool _, CancellationToken cancelToken)
    {
        using var __ = log.Time("DB seeding");

        await SeedPkmFilesData(db, cancelToken);
    }

    private async Task SeedPkmFilesData(DbContext db, CancellationToken cancelToken)
    {
        var pkmFilesDb = db.Set<PkmFileEntity>();
        var pkmVariantsDb = db.Set<PkmVariantEntity>();

        using var _ = log.Time("Seed PKM files migration");

        // get all PkmFile
        // but only ones linked to PkmVariant
        var pkmFiles = await pkmVariantsDb
            .AsNoTracking()
            .Include(p => p.PkmFile)
            .Select(p => p.PkmFile!)
            .ToListAsync(cancelToken);

        var updatedPkmFiles = await Task.WhenAll(pkmFiles.Select(pkmFile => PkmFileLoader.LoadPkmFile(fileIOService, pkmFile)));

        pkmFilesDb.UpdateRange(updatedPkmFiles);

        await db.SaveChangesAsync(cancelToken);
    }
}
