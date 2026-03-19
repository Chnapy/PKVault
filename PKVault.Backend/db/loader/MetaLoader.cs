using Microsoft.EntityFrameworkCore;

public interface IMetaLoader
{
    public Task<MetaEntity?> GetEntity(MetaKey key);
    public Task<MetaEntity> AddEntity(MetaEntity entity);
    public Task UpdateEntity(MetaEntity entity);
}

public class MetaLoader(SessionDbContext db, ISessionServiceMinimal sessionService) : IMetaLoader
{
    public async Task<MetaEntity?> GetEntity(MetaKey key)
    {
        var dbSet = await GetDbSet();

        return await dbSet.FindAsync(key);
    }

    public async Task<MetaEntity> AddEntity(MetaEntity entity)
    {
        var dbSet = await GetDbSet();

        await dbSet.AddAsync(entity);

        await db.SaveChangesAsync();

        return entity;
    }

    public async Task UpdateEntity(MetaEntity entity)
    {
        var dbSet = await GetDbSet();

        dbSet.Update(entity);

        await db.SaveChangesAsync();
    }

    private async Task<DbSet<MetaEntity>> GetDbSet()
    {
        await sessionService.EnsureSessionCreated(db.ContextId.InstanceId);

        return GetDbSetRaw();
    }

    private DbSet<MetaEntity> GetDbSetRaw() => db.Metas;
}