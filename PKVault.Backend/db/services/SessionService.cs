using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

public interface ISessionService : ISessionServiceMinimal
{
    public DateTime? StartTime { get; }
    public List<SessionService.ActionRecord> Actions { get; }

    public bool HasMainDb();
    public bool HasEmptyActionList();
    public List<DataActionPayload> GetActionPayloadList();

    public Task StartNewSession(bool checkInitialActions, DataUpdateFlags? flags);
    public Task PersistSession(IServiceScope scope);
}

public interface ISessionServiceMinimal
{
    public string MainDbPath { get; }
    public string MainDbRelativePath { get; }
    public string SessionDbPath { get; }

    public Task EnsureSessionCreated(Guid? byPassContextId = null);
}

public class SessionService(
    ILogger<SessionService> log,
    IServiceProvider sp, TimeProvider timeProvider,
    IFileIOService fileIOService, ISettingsService settingsService,
    ISavesLoadersService savesLoadersService
) : ISessionService
{
    public record ActionRecord(
        Func<IServiceScope, DataUpdateFlags, Task<DataActionPayload>> ActionFn,
        DataActionPayload Payload
    );

    private string DbFolderPath => settingsService.GetSettings().GetDbPath();
    public string MainDbPath => Path.Combine(DbFolderPath, "pkvault.db");
    public string MainDbRelativePath => Path.Combine(settingsService.GetSettings().SettingsMutable.DB_PATH, "pkvault.db");
    public string SessionDbPath => Path.Combine(DbFolderPath, "pkvault-session.db");

    public DateTime? StartTime { get; private set; }

    private Task<DataUpdateFlags>? StartTask = null;

    // bypass DB check if same as DB.ContextId
    private Guid? ByPassContextId = null;

    public List<ActionRecord> Actions { get; } = [];

    public bool HasMainDb() => fileIOService.Exists(MainDbPath);

    public List<DataActionPayload> GetActionPayloadList()
    {
        return [.. Actions.Select(action => action.Payload)];
    }

    public bool HasEmptyActionList()
    {
        return Actions.Count == 0;
    }

    public async Task StartNewSession(bool checkInitialActions, DataUpdateFlags? flags)
    {
        StartTime = timeProvider.GetUtcNow().DateTime;

        using var _ = log.Time("Starting new session");

        Actions.Clear();

        StartTask = Task.Run(async () =>
        {
            flags ??= new();

            await Task.WhenAll(
                ResetDbSession(flags),
                savesLoadersService.Setup(flags)
            );

            if (checkInitialActions)
            {
                using var scope = sp.CreateScope();

                // required to avoid deadlocks, ex: SessionService => SynchronizeAction => loaders => SessionService
                ByPassContextId = scope.ServiceProvider.GetRequiredService<SessionDbContext>()
                    .ContextId.InstanceId;

                var hadDataToNormalize = await CheckDataToNormalize(scope, flags);

                await CheckSaveToSynchronize(scope, flags);

                if (hadDataToNormalize)
                {
                    await CheckFirstRunAutoSave(scope, flags);
                }

                ByPassContextId = null;
            }

            return flags;
        });

        await StartTask;
    }

    private async Task<bool> CheckDataToNormalize(IServiceScope scope, DataUpdateFlags flags)
    {
        var actionService = scope.ServiceProvider.GetRequiredService<ActionService>();
        var dataNormalizeAction = scope.ServiceProvider.GetRequiredService<DataNormalizeAction>();
        var updateExternalPkmAction = scope.ServiceProvider.GetRequiredService<UpdateExternalPkmAction>();

        var dataToNormalizeInput = await dataNormalizeAction.HasDataToNormalize();

        if (dataToNormalizeInput.ShouldRun)
        {
            await actionService.DataNormalize(dataToNormalizeInput, scope, flags);
        }

        try
        {
            var externalPkmsToUpdateInput = await updateExternalPkmAction.HasExternalPkmsToUpdate();

            if (externalPkmsToUpdateInput.ShouldRun)
            {
                await actionService.UpdateExternalPkm(externalPkmsToUpdateInput, scope, flags);
            }

            return externalPkmsToUpdateInput.ShouldRun;
        }
        catch (Exception ex)
        {
            log.LogError(ex.ToString());
        }
        return false;
    }

    private async Task CheckSaveToSynchronize(IServiceScope scope, DataUpdateFlags flags)
    {
        var actionService = scope.ServiceProvider.GetRequiredService<ActionService>();
        var synchronizePkmAction = scope.ServiceProvider.GetRequiredService<SynchronizePkmAction>();

        var synchronizationData = await synchronizePkmAction.GetSavesPkmsToSynchronize();

        foreach (var data in synchronizationData)
        {
            if (data.pkmVariantAndPkmSaveIds.Length > 0)
            {
                await actionService.SynchronizePkm(data, scope, flags);
            }
        }
    }

    /**
     * If first app run (with no data),
     * persist session data then restart new one, for conveniance,
     * avoiding the need to save initial data
     */
    private async Task CheckFirstRunAutoSave(IServiceScope scope, DataUpdateFlags flags)
    {
        var savesLoaders = scope.ServiceProvider.GetRequiredService<ISavesLoadersService>();
        var pkmVariantLoader = scope.ServiceProvider.GetRequiredService<IPkmVariantLoader>();

        var hasAnyData = savesLoaders.GetAllLoaders().Length > 0
            || await pkmVariantLoader.Any();

        if (!hasAnyData)
        {
            log.LogInformation($"Fresh start detected - Session persisting & retarting");
            await PersistSession(scope);
            await StartNewSession(checkInitialActions: false, flags);
        }
    }

    public async Task EnsureSessionCreated(Guid? byPassContextId = null)
    {
        if (StartTask == null)
        {
            log.LogInformation($"Session no created - Start new one");
            await StartNewSession(checkInitialActions: true, null);
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

    public async Task PersistSession(IServiceScope scope)
    {
        using var _ = log.Time($"Persist session with copy session to main");

        // before copy to main:
        // - persist PKM files
        // - clear session-only PkmFile tables
        var pkmFileLoader = scope.ServiceProvider.GetRequiredService<IPkmFileLoader>();
        await pkmFileLoader.WriteToFiles();

        await savesLoadersService.WriteToFiles();
        savesLoadersService.Clear();

        Actions.Clear();

        await CloseConnection();
        StartTask = null;

        log.LogDebug($"Move session DB to main");
        fileIOService.Move(SessionDbPath, MainDbPath, overwrite: true);

        StartTime = null;
    }

    private async Task ResetDbSession(DataUpdateFlags flags)
    {
        if (fileIOService.Exists(SessionDbPath))
        {
            using var scope = sp.CreateScope();
            using var db = scope.ServiceProvider.GetRequiredService<SessionDbContext>();

            var deleted1 = await db.Database.EnsureDeletedAsync();
            var deleted2 = fileIOService.Delete(SessionDbPath);
            fileIOService.Delete(SessionDbPath + "-shm");
            fileIOService.Delete(SessionDbPath + "-wal");

            log.LogDebug($"DB session deleted={deleted1}/{deleted2}");
        }

        if (fileIOService.Exists(MainDbPath))
        {
            fileIOService.Copy(MainDbPath, SessionDbPath, overwrite: true);

            log.LogDebug($"DB main copied to session");
        }

        await RunDbMigrations();

        flags.MainBanks.All = true;
        flags.MainBoxes.All = true;
        flags.MainPkmVariants.All = true;
        flags.Dex.All = true;
        flags.Warnings = true;
    }

    private async Task RunDbMigrations()
    {
        using var _ = log.Time("Data Migration + Clean + Seeding");

        using var scope = sp.CreateScope();
        using var db = scope.ServiceProvider.GetRequiredService<SessionDbContext>();

        // log.LogInformation($"CONTEXT ID = {db.ContextId.InstanceId}");

        var migrations = db.Database.GetMigrations();
        if (!migrations.Any())
        {
            throw new InvalidOperationException($"No migration files");
        }

        var pendingMigrations = await db.Database.GetPendingMigrationsAsync();

        log.LogDebug($"{pendingMigrations.Count()} pending migrations");
        log.LogDebug($"{string.Join('\n', pendingMigrations)}");

        // DB creation requires its directory to be created
        fileIOService.CreateDirectoryIfAny(MainDbPath);
        fileIOService.CreateDirectoryIfAny(SessionDbPath);

        // migrations may fail in publish-trimmed if columns names not defined
        await db.Database.MigrateAsync();

        var appliedMigrations = await db.Database.GetAppliedMigrationsAsync();

        log.LogInformation($"{appliedMigrations.Count()} applied migrations");
    }

    private async Task CloseConnection()
    {
        using var _ = log.Time($"SessionService.CloseConnection");

        using var scope = sp.CreateScope();
        using var db = scope.ServiceProvider.GetRequiredService<SessionDbContext>();

        // required to really close connection
        if (db.Database.GetDbConnection() is SqliteConnection sqliteConnection)
        {
            SqliteConnection.ClearPool(sqliteConnection);
        }

        await db.Database.CloseConnectionAsync();

        log.LogInformation($"DB session connection closed");
    }
}
