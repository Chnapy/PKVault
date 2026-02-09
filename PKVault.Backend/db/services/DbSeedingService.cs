using Microsoft.EntityFrameworkCore;

public interface IDbSeedingService
{
    public Task Seed(DbContext db, bool _, CancellationToken cancelToken);
}

public class DbSeedingService(IFileIOService fileIOService) : IDbSeedingService
{
    public async Task Seed(DbContext db, bool _, CancellationToken cancelToken)
    {
        using var __ = LogUtil.Time("DB seeding");

        await SeedPkmFilesData(db, cancelToken);
    }

    private async Task SeedPkmFilesData(DbContext db, CancellationToken cancelToken)
    {
        var pkmFilesDb = db.Set<PkmFileEntity>();

        using var _ = LogUtil.Time("Seed PKM files migration");

        var pkmFiles = await pkmFilesDb
            .ToListAsync(cancelToken);

        var updatedPkmFiles = await Task.WhenAll(pkmFiles.Select(UpdatePkmFile));

        pkmFilesDb.UpdateRange(updatedPkmFiles);

        await db.SaveChangesAsync(cancelToken);
    }

    private async Task<PkmFileEntity> UpdatePkmFile(PkmFileEntity pkmFile)
    {
        var filepath = Path.Combine(SettingsService.GetAppDirectory(), pkmFile.Filepath);

        try
        {
            var (TooSmall, TooBig) = fileIOService.CheckGameFile(filepath);

            if (TooBig)
                throw new PKMLoadException(PKMLoadError.TOO_BIG);

            if (TooSmall)
                throw new PKMLoadException(PKMLoadError.TOO_SMALL);

            pkmFile.Data = await fileIOService.ReadBytes(filepath);
            pkmFile.Error = null;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine(ex);

            pkmFile.Data = [];
            pkmFile.Error = PkmFileLoader.GetPKMLoadError(ex);
        }

        pkmFile.Updated = false;
        pkmFile.Deleted = false;

        return pkmFile;
    }
}
