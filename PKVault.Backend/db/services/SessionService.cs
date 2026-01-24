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
            try
            {
                // DB context should be stopped before file delete
                using (var scope = sp.CreateScope())
                {
                    using var db = scope.ServiceProvider.GetRequiredService<SessionDbContext>();

                    // required to really close connection
                    if (db.Database.GetDbConnection() is SqliteConnection sqliteConnection)
                    {
                        SqliteConnection.ClearPool(sqliteConnection);
                    }

                    await db.Database.CloseConnectionAsync();
                    await db.DisposeAsync();

                    Console.WriteLine($"DB CONNECTION CLOSED");
                }

                // GC.Collect();
                // GC.WaitForPendingFinalizers();
                // GC.Collect();

                fileIOService.Delete(SessionDbPath + "-wal");
                fileIOService.Delete(SessionDbPath + "-shm");
                fileIOService.Delete(SessionDbPath);
            }
            catch (IOException)
            {
                await Task.Delay(500);
                fileIOService.Delete(SessionDbPath + "-wal");
                fileIOService.Delete(SessionDbPath + "-shm");
                fileIOService.Delete(SessionDbPath);
            }
        }

        if (fileIOService.Exists(MainDbPath))
        {
            fileIOService.Copy(MainDbPath, SessionDbPath, overwrite: false);
        }
    }

    public void PersistSession()
    {
        fileIOService.Move(SessionDbPath, MainDbPath, overwrite: true);
    }
}
