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

    public async Task StartNewSession(bool checkInitialActions)
    {
        StartTime = DateTime.UtcNow;

        using var _ = LogUtil.Time("Starting new session");

        var task = Task.Run(async () =>
        {
            await Task.WhenAll(
                ResetDbSession(),
                savesLoadersService.Setup()
            );

            if (checkInitialActions)
            {
                using var scope = sp.CreateScope();

                // required to avoid deadlocks, ex: SessionService => SynchronizeAction => loaders => SessionService
                ByPassContextId = scope.ServiceProvider.GetRequiredService<SessionDbContext>()
                    .ContextId.InstanceId;

                await CheckDataToNormalize(scope);

                await CheckSaveToSynchronize(scope);

                ByPassContextId = null;
            }
        });

        StartTask = task;

        await task;
    }

    private async Task CheckDataToNormalize(IServiceScope scope)
    {
        var actionService = scope.ServiceProvider.GetRequiredService<ActionService>();
        var dataNormalizeAction = scope.ServiceProvider.GetRequiredService<DataNormalizeAction>();

        if (await dataNormalizeAction.HasDataToNormalize())
        {
            await actionService.DataNormalize(scope);
        }
    }

    private async Task CheckSaveToSynchronize(IServiceScope scope)
    {
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
    }

    public async Task EnsureSessionCreated(Guid? byPassContextId = null)
    {
        if (StartTask == null)
        {
            await StartNewSession(checkInitialActions: true);
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
        using var _ = LogUtil.Time($"Persist session with copy session to main");

        // before copy to main:
        // - persist PKM files
        // - clear session-only PkmFile tables
        using (var scope = sp.CreateScope())
        {
            var pkmFileLoader = scope.ServiceProvider.GetRequiredService<IPkmFileLoader>();

            await pkmFileLoader.WriteToFiles();
        }

        await savesLoadersService.WriteToFiles();
        savesLoadersService.Clear();

        await CloseConnection();
        StartTask = null;

        Console.WriteLine($"Move session DB to main");
        fileIOService.Move(SessionDbPath, MainDbPath, overwrite: true);

        StartTime = null;
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

        var migrations = db.Database.GetMigrations();
        if (!migrations.Any())
        {
            throw new InvalidOperationException($"No migration files");
        }

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
        using var _ = LogUtil.Time($"SessionService.CloseConnection");

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
