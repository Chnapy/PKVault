using Microsoft.Extensions.FileSystemGlobbing;
using Microsoft.Extensions.FileSystemGlobbing.Abstractions;

public class MaintenanceService(
    // Direct use of service-provider because of circular dependencies
    IServiceProvider sp,
    LoaderService loaderService, SaveService saveService
)
{
    public async Task DataSetupMigrateClean()
    {
        var time = LogUtil.Time("Data Setup + Migrate + Clean");

        using var scope = sp.CreateScope();

        var bankLoader = new BankLoader();
        var boxLoader = new BoxLoader();
        var pkmLoader = new PkmLoader();
        var pkmVersionLoader = new PkmVersionLoader(pkmLoader);
        var dexLoader = new DexLoader();

        DataEntityLoaders loaders = new(saveService)
        {
            bankLoader = bankLoader,
            boxLoader = boxLoader,
            pkmLoader = pkmLoader,
            pkmVersionLoader = pkmVersionLoader,
            dexLoader = dexLoader,
            saveLoadersDict = [],
        };

        loaders.SetupInitialData();
        loaders.MigrateGlobalEntities();
        loaders.CleanData();

        if (loaders.GetHasWritten())
        {
            scope.ServiceProvider.GetRequiredService<BackupService>()
                .CreateBackup();

            await loaders.WriteToFiles();
        }

        time();
    }

    public async Task CleanMainStorageFiles()
    {
        var time = LogUtil.Time($"Storage obsolete files clean up");

        using var scope = sp.CreateScope();

        var loader = await loaderService.GetLoader();
        var pkmVersionsFilepaths = loader.loaders.pkmVersionLoader.GetAllDtos().Select(dto => dto.PkmVersionEntity.Filepath).ToList();

        var rootDir = ".";
        var storagePath = SettingsService.BaseSettings.GetStoragePath();

        var matcher = new Matcher();
        matcher.AddInclude(Path.Combine(storagePath, "**/*"));
        var matches = matcher.Execute(new DirectoryInfoWrapper(new DirectoryInfo(rootDir)));

        var pathsToClean = matches.Files
        .Select(file => Path.Combine(rootDir, file.Path))
        .Select(MatcherUtil.NormalizePath)
        .Select(path => pkmVersionsFilepaths.Contains(path) ? null : path)
        .OfType<string>();

        var pkmVersionFilesToDelete = pkmVersionsFilepaths.Count - (matches.Files.Count() - pathsToClean.Count());

        Console.WriteLine($"Total files count = {matches.Files.Count()}");
        Console.WriteLine($"PkmVersion count = {pkmVersionsFilepaths.Count}");
        Console.WriteLine($"Paths to clean count = {pathsToClean.Count()}");

        if (pkmVersionFilesToDelete != 0)
        {
            throw new Exception($"Inconsistant delete, {pkmVersionFilesToDelete} files for PkmVersions may be deleted");
        }

        if (pathsToClean.Any())
        {
            scope.ServiceProvider.GetRequiredService<BackupService>()
                .CreateBackup();

            foreach (var path in pathsToClean)
            {
                Console.WriteLine($"Clean obsolete file {path}");
                File.Delete(path);
            }

            Console.WriteLine($"Total files count = {matches.Files.Count()}");
            Console.WriteLine($"PkmVersion count = {pkmVersionsFilepaths.Count}");
            Console.WriteLine($"Paths to clean count = {pathsToClean.Count()}");
        }

        time();
    }
}
