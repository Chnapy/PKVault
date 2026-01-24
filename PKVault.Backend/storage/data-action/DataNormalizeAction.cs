using Microsoft.EntityFrameworkCore;

public record DataNormalizeActionInput();

public class DataNormalizeAction(
    SessionDbContext db
) : DataAction<DataNormalizeActionInput>
{
    protected override async Task<DataActionPayload> Execute(DataNormalizeActionInput input, DataUpdateFlags flags)
    {
        var time = LogUtil.Time("Data Migration + Clean + Seeding");

        // Console.WriteLine($"CONTEXT ID = {db.ContextId.InstanceId}");

        var pendingMigrations = await db.Database.GetPendingMigrationsAsync();

        Console.WriteLine($"{pendingMigrations.Count()} pending migrations");
        Console.WriteLine($"{string.Join('\n', pendingMigrations)}");

        // careful: not compatible with PublishTrimmed
        // await db.Database.MigrateAsync();

        await db.Database.EnsureCreatedAsync();

        var appliedMigrations = await db.Database.GetAppliedMigrationsAsync();

        Console.WriteLine($"{appliedMigrations.Count()} applied migrations");

        time();

        return new(
            type: DataActionType.DATA_NORMALIZE,
            parameters: []
        );
    }
}
