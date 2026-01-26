using Microsoft.EntityFrameworkCore;

public abstract class EntityLoader<DTO, E> : IEntityLoader<DTO, E> where DTO : IWithId where E : IEntity
{
    protected IFileIOService fileIOService;
    protected SessionService sessionService;
    protected SessionDbContext db;
    private DataUpdateFlagsState<string> flags;

    public EntityLoader(
        IFileIOService _fileIOService,
        SessionService _sessionService,
        SessionDbContext _db,
        DataUpdateFlagsState<string> _flags
    )
    {
        fileIOService = _fileIOService;
        sessionService = _sessionService;
        db = _db;
        flags = _flags;
    }

    protected abstract Task<DTO> GetDTOFromEntity(E entity);

    public async Task<List<DTO>> GetAllDtos()
    {
        var entities = await GetAllEntities();

        return [.. await Task.WhenAll(entities.Values.Select(GetDTOFromEntity))];
    }

    public virtual async Task<Dictionary<string, E>> GetAllEntities()
    {
        var dbSet = await GetDbSet();

        using var _ = LogUtil.Time($"{typeof(E)} - GetAllEntities");

        // Console.WriteLine($"{typeof(E).Name} - GetAllEntities - ContextId={db.ContextId}");
        return await dbSet
            .AsNoTracking()
            .ToDictionaryAsync(e => e.Id);
    }

    public async Task<DTO?> GetDto(string id)
    {
        var entity = await GetEntity(id);
        return entity == null ? default : await GetDTOFromEntity(entity);
    }

    public virtual async Task<E?> GetEntity(string id)
    {
        var dbSet = await GetDbSet();

        using var _ = LogUtil.Time($"{typeof(E)} - GetEntity");

        return await dbSet.FindAsync(id);
    }

    public virtual async Task DeleteEntity(E entity)
    {
        var dbSet = await GetDbSet();

        using var _ = LogUtil.Time($"{typeof(E)} - DeleteEntity");

        dbSet.Remove(entity);
        await SaveChanges();

        flags.Ids.Add(entity.Id);
        Console.WriteLine($"Deleted {typeof(E)} id={entity.Id}");
    }

    public virtual async Task<E> AddEntity(E entity)
    {
        Console.WriteLine($"{entity.GetType().Name} - Add id={entity.Id} - ContextId={db.ContextId}");

        var dbSet = await GetDbSet();

        using var _ = LogUtil.Time($"{typeof(E)} - AddEntity");

        await dbSet.AddAsync(entity);
        await SaveChanges();
        // Console.WriteLine($"Context={db.ContextId}");

        flags.Ids.Add(entity.Id);

        return entity;
    }

    public virtual async Task UpdateEntity(E entity)
    {
        Console.WriteLine($"{entity.GetType().Name} - Update id={entity.Id} - ContextId={db.ContextId}");

        var dbSet = await GetDbSet();

        using var _ = LogUtil.Time($"{typeof(E)} - UpdateEntity");

        dbSet.Update(entity);
        await SaveChanges();
        // Console.WriteLine($"Context={db.ContextId}");

        flags.Ids.Add(entity.Id);
    }

    public async Task<E> First()
    {
        var dbSet = await GetDbSet();

        using var _ = LogUtil.Time($"{typeof(E)} - First");

        return await dbSet.FirstAsync();
    }

    public async Task<int> Count()
    {
        var dbSet = await GetDbSet();

        using var _ = LogUtil.Time($"{typeof(E)} - Count");

        return await dbSet.CountAsync();
    }

    public async Task SaveChanges()
    {
        await db.SaveChangesAsync();
    }

    public void SetFlags(DataUpdateFlagsState<string> _flags)
    {
        flags = _flags;
    }

    protected async Task<DbSet<E>> GetDbSet()
    {
        await sessionService.EnsureSessionCreated(db.ContextId.InstanceId);

        return GetDbSetRaw();
    }

    protected abstract DbSet<E> GetDbSetRaw();
}
