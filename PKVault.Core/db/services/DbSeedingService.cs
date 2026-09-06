using Microsoft.EntityFrameworkCore;
using Serilog;

namespace PKVault.Core;

public interface IDbSeedingService
{
    public Task Seed(DbContext db, bool _, CancellationToken cancelToken);
}

public class DbSeedingService(IFileIOService fileIOService) : IDbSeedingService
{
    public async Task Seed(DbContext db, bool _, CancellationToken cancelToken)
    {
        using var __ = Log.Logger.Time("DB seeding");

        await SeedPkmFilesData(db, cancelToken);
    }

    private async Task SeedPkmFilesData(DbContext db, CancellationToken cancelToken)
    {
        var pkmFilesDb = db.Set<PkmFileEntity>();

        using var _ = Log.Logger.Time("Seed PKM files migration");

        // get all PkmFile without distinction
        var pkmFiles = await pkmFilesDb
            .AsNoTracking()
            .ToListAsync(cancelToken);

        var updatedPkmFiles = new List<PkmFileEntity>(pkmFiles.Count);
        // less performant than Task.WhenAll (1000pkm: 500ms vs 400ms)
        // but avoids CPU spikes
        foreach (var pkmFile in pkmFiles)
        {
            updatedPkmFiles.Add(
                await PkmFileLoader.LoadPkmFile(fileIOService, pkmFile, checkBeforeLoad: false)
            );
        }

        pkmFilesDb.UpdateRange(updatedPkmFiles);

        await db.SaveChangesAsync(cancelToken);
    }
}
