using Microsoft.Extensions.FileSystemGlobbing;
using Microsoft.Extensions.FileSystemGlobbing.Abstractions;

/**
 * Data maintenance, out of app common lifecycle.
 */
public class MaintenanceService(
    // Direct use of service-provider because of circular dependencies
    IServiceProvider sp,
    IFileIOService fileIOService, ISettingsService settingsService
)
{
    public async Task CleanMainStorageFiles()
    {
        using var _ = LogUtil.Time($"Storage obsolete files clean up");

        using var scope = sp.CreateScope();

        var pkmVariantLoader = scope.ServiceProvider.GetRequiredService<IPkmVariantLoader>();

        var pkmVariantsFilepaths = (await pkmVariantLoader.GetAllEntities()).Values.Select(entity => entity.Filepath).ToList();

        var rootDir = ".";
        var storagePath = settingsService.GetSettings().GetStoragePath();

        var matcher = new Matcher();
        matcher.AddInclude(Path.Combine(storagePath, "**/*"));
        var matches = matcher.Execute(new DirectoryInfoWrapper(new DirectoryInfo(rootDir)));

        var pathsToClean = matches.Files
        .Select(file => Path.Combine(rootDir, file.Path))
        .Select(MatcherUtil.NormalizePath)
        .Select(path => pkmVariantsFilepaths.Contains(path) ? null : path)
        .OfType<string>();

        var pkmVariantFilesToDelete = pkmVariantsFilepaths.Count - (matches.Files.Count() - pathsToClean.Count());

        Console.WriteLine($"Total files count = {matches.Files.Count()}");
        Console.WriteLine($"PkmVariant count = {pkmVariantsFilepaths.Count}");
        Console.WriteLine($"Paths to clean count = {pathsToClean.Count()}");

        if (pkmVariantFilesToDelete != 0)
        {
            throw new Exception($"Inconsistant delete, {pkmVariantFilesToDelete} files for PkmVariants may be deleted");
        }

        if (pathsToClean.Any())
        {
            await scope.ServiceProvider.GetRequiredService<BackupService>()
                .CreateBackup();

            foreach (var path in pathsToClean)
            {
                Console.WriteLine($"Clean obsolete file {path}");
                fileIOService.Delete(path);
            }

            Console.WriteLine($"Total files count = {matches.Files.Count()}");
            Console.WriteLine($"PkmVariant count = {pkmVariantsFilepaths.Count}");
            Console.WriteLine($"Paths to clean count = {pathsToClean.Count()}");
        }
    }
}
