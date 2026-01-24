using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

public record DataNormalizeActionInput();

public class DataNormalizeAction(
    IFileIOService fileIOService, ISettingsService settingsService, ISaveService saveService,
    SessionService sessionService, StaticDataService staticDataService, SessionDbContext db
) : DataAction<DataNormalizeActionInput>
{
    protected override async Task<DataActionPayload?> Execute(DataNormalizeActionInput input, DataUpdateFlags flags)
    {
        var time = LogUtil.Time("Data Setup + Migrate + Clean");

        // Console.WriteLine($"CONTEXT ID = {db.ContextId.InstanceId}");

        var isUsingSqlite = sessionService.HasMainDb();
        var legacyMigrationsRan = false;
        if (!isUsingSqlite)
        {
            legacyMigrationsRan = await RunLegacyDataMigration();
        }

        var pendingMigrations = await db.Database.GetPendingMigrationsAsync();
        var hasAnyMigrations = pendingMigrations.Any();

        Console.WriteLine($"{pendingMigrations.Count()} pending migrations");
        Console.WriteLine($"{string.Join('\n', pendingMigrations)}");

        await db.Database.MigrateAsync();

        var appliedMigrations = await db.Database.GetAppliedMigrationsAsync();

        Console.WriteLine($"{appliedMigrations.Count()} applied migrations");

        time();

        return hasAnyMigrations || legacyMigrationsRan
            ? new(
                type: DataActionType.DATA_NORMALIZE,
                parameters: []
            )
            : null;
    }

    private async Task<bool> RunLegacyDataMigration()
    {
        var staticData = await staticDataService.GetStaticData();
        var evolves = staticData.Evolves;

        var settings = settingsService.GetSettings();
        var dbPath = settings.SettingsMutable.DB_PATH;
        var storagePath = settings.SettingsMutable.STORAGE_PATH;

        var legacyBankLoader = new LegacyBankLoader(fileIOService, dbPath);
        var legacyBoxLoader = new LegacyBoxLoader(fileIOService, dbPath);
        var legacyPkmLoader = new LegacyPkmLoader(fileIOService, dbPath);
        var legacyPkmVersionLoader = new LegacyPkmVersionLoader(
            fileIOService,
            dbPath,
            storagePath,
            evolves
        );
        var legacyDexLoader = new LegacyDexLoader(fileIOService, dbPath);

        string[] filepaths = [legacyBankLoader.FilePath, legacyBoxLoader.FilePath, legacyPkmLoader.FilePath, legacyPkmVersionLoader.FilePath, legacyDexLoader.FilePath];
        var hasLegacy = filepaths.Any(fileIOService.Exists);
        if (!hasLegacy)
        {
            return false;
        }

        var saveById = await saveService.GetSaveCloneById();

        var legacyBankNormalize = new LegacyBankNormalize(legacyBankLoader);
        var legacyBoxNormalize = new LegacyBoxNormalize(legacyBoxLoader);
        var legacyPkmNormalize = new LegacyPkmNormalize(legacyPkmLoader, evolves);
        var legacyPkmVersionNormalize = new LegacyPkmVersionNormalize(legacyPkmVersionLoader, evolves);
        var legacyDexNormalize = new LegacyDexNormalize(legacyDexLoader);

        legacyPkmNormalize.CleanData(legacyPkmVersionLoader);
        legacyPkmVersionNormalize.CleanData();

        legacyBankNormalize.MigrateGlobalEntities();
        legacyBoxNormalize.MigrateGlobalEntities(legacyBankLoader);
        legacyPkmNormalize.MigrateGlobalEntities(legacyPkmVersionLoader, saveById);
        legacyPkmVersionNormalize.MigrateGlobalEntities();
        legacyDexNormalize.MigrateGlobalEntities();

        await legacyBankLoader.WriteToFile();
        await legacyBoxLoader.WriteToFile();
        await legacyPkmVersionLoader.WriteToFile();
        await legacyDexLoader.WriteToFile();

        return true;
    }
}
