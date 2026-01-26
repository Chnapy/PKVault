using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

public class SessionService(
    IServiceProvider sp,
    IFileIOService fileIOService, ISettingsService settingsService,
    ISavesLoadersService savesLoadersService
)
{
    private string DbFolderPath => settingsService.GetSettings().SettingsMutable.DB_PATH;
    public string MainDbPath => Path.Combine(DbFolderPath, "pkvault.db");
    public string SessionDbPath => Path.Combine(DbFolderPath, "pkvault-session.db");

    public DateTime? StartTime { get; private set; }

    private Task? StartTask = null;

    // bypass DB check if same as DB.ContextId
    private Guid? ByPassContextId = null;

    public bool HasMainDb() => fileIOService.Exists(MainDbPath);

    public async Task StartNewSession(bool checkSynchronize)
    {
        StartTime = DateTime.UtcNow;

        using var _ = LogUtil.Time("Starting new session");

        var task = Task.Run(async () =>
        {
            await Task.WhenAll(
                ResetDbSession(),
                savesLoadersService.Setup()
            );

            if (checkSynchronize)
            {
                await CheckSaveToSynchronize();
            }
        });

        StartTask = task;

        await task;
    }

    private async Task CheckSaveToSynchronize()
    {
        using var scope = sp.CreateScope();

        // required to avoid deadlock: SessionService => SynchronizeAction => loaders => SessionService
        ByPassContextId = scope.ServiceProvider.GetRequiredService<SessionDbContext>()
            .ContextId.InstanceId;

        var actionService = scope.ServiceProvider.GetRequiredService<ActionService>();
        var synchronizePkmAction = scope.ServiceProvider.GetRequiredService<SynchronizePkmAction>();

        var synchronizationData = await synchronizePkmAction.GetSavesPkmsToSynchronize();

        foreach (var data in synchronizationData)
        {
            if (data.pkmVersionAndPkmSaveIds.Length > 0)
            {
                await actionService.SynchronizePkm(data, scope);
            }
        }

        ByPassContextId = null;
    }

    public async Task EnsureSessionCreated(Guid? byPassContextId = null)
    {
        if (StartTask == null)
        {
            await StartNewSession(checkSynchronize: true);
        }
        // bypass check
        else if (byPassContextId != null && byPassContextId == ByPassContextId)
        {
            return;
        }
        else
        {
            await StartTask;
        }
    }

    public async Task PersistSession()
    {
        // before copy to main:
        // - persist PKM files
        // - clear session-only PkmFile tables
        using (var scope = sp.CreateScope())
        {
            var pkmFileLoader = scope.ServiceProvider.GetRequiredService<PkmFileLoader>();

            await pkmFileLoader.WriteToFiles();
            await pkmFileLoader.ClearData();
        }

        await savesLoadersService.WriteToFiles();
        savesLoadersService.Clear();

        await CloseConnection();
        StartTask = null;

        fileIOService.Move(SessionDbPath, MainDbPath, overwrite: true);

        StartTime = null;

        Console.WriteLine($"DB session copied to main");
    }

    private async Task ResetDbSession()
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

        await RunDbMigrations();
    }

    private async Task RunDbMigrations()
    {
        using var _ = LogUtil.Time("Data Migration + Clean + Seeding");

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
