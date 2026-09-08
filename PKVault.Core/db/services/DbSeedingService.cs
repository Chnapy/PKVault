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

        // drop orphaned PkmFile rows
        var referencedFilepaths = (await db.Set<PkmVariantEntity>()
            .AsNoTracking()
            .Select(variant => variant.Filepath)
            .ToListAsync(cancelToken))
            .ToHashSet();

        var orphanedPkmFiles = pkmFiles
            .Where(pkmFile => !referencedFilepaths.Contains(pkmFile.Filepath))
            .ToList();

        if (orphanedPkmFiles.Count > 0)
        {
            Log.Warning($"Removing {orphanedPkmFiles.Count} orphaned PkmFile DB row(s), no longer referenced by any pkm variant");
            pkmFilesDb.RemoveRange(orphanedPkmFiles);
        }

        var pkmFilesToLoad = pkmFiles
            .Where(pkmFile => referencedFilepaths.Contains(pkmFile.Filepath));

        var updatedPkmFiles = new List<PkmFileEntity>(pkmFiles.Count);
        // less performant than Task.WhenAll (1000pkm: 500ms vs 400ms)
        // but avoids CPU spikes
        foreach (var pkmFile in pkmFilesToLoad)
        {
            updatedPkmFiles.Add(
                await PkmFileLoader.LoadPkmFile(fileIOService, pkmFile, checkBeforeLoad: false)
            );
        }

        pkmFilesDb.UpdateRange(updatedPkmFiles);

        await db.SaveChangesAsync(cancelToken);
    }
}
