using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

public class SessionService(
    IServiceProvider sp,
    IFileIOService fileIOService, ISettingsService settingsService
)
{
    private string DbFolderPath => settingsService.GetSettings().SettingsMutable.DB_PATH;
    public string MainDbPath => Path.Combine(DbFolderPath, "pkvault.db");
    public string SessionDbPath => Path.Combine(DbFolderPath, "pkvault-session.db");

    public bool HasMainDb() => fileIOService.Exists(MainDbPath);

    public async Task StartNewSession()
    {
        if (fileIOService.Exists(SessionDbPath))
        {
            using var scope = sp.CreateScope();
            using var db = scope.ServiceProvider.GetRequiredService<SessionDbContext>();

            await db.Database.EnsureDeletedAsync();

            Console.WriteLine($"DB session deleted");
        }

        if (fileIOService.Exists(MainDbPath))
        {
            fileIOService.Copy(MainDbPath, SessionDbPath, overwrite: true);

            Console.WriteLine($"DB main copied to session");
        }

        await RunMigrations();
    }

    public async Task PersistSession()
    {
        await CloseConnection();

        fileIOService.Move(SessionDbPath, MainDbPath, overwrite: true);

        Console.WriteLine($"DB session copied to main");
    }

    private async Task RunMigrations()
    {
        var time = LogUtil.Time("Data Migration + Clean + Seeding");

        using var scope = sp.CreateScope();
        using var db = scope.ServiceProvider.GetRequiredService<SessionDbContext>();

        // Console.WriteLine($"CONTEXT ID = {db.ContextId.InstanceId}");

        var pendingMigrations = await db.Database.GetPendingMigrationsAsync();

        Console.WriteLine($"{pendingMigrations.Count()} pending migrations");
        Console.WriteLine($"{string.Join('\n', pendingMigrations)}");

        // migrations may fail in publish-trimmed if columns names not defined
        await db.Database.MigrateAsync();

        var appliedMigrations = await db.Database.GetAppliedMigrationsAsync();

        Console.WriteLine($"{appliedMigrations.Count()} applied migrations");

        time();
    }

    private async Task CloseConnection()
    {
        using var scope = sp.CreateScope();
        using var db = scope.ServiceProvider.GetRequiredService<SessionDbContext>();

        // required to really close connection
        if (db.Database.GetDbConnection() is SqliteConnection sqliteConnection)
        {
            SqliteConnection.ClearPool(sqliteConnection);
        }

        await db.Database.CloseConnectionAsync();

        Console.WriteLine($"DB session connection closed");
    }
}
