using System.Diagnostics.CodeAnalysis;
using Microsoft.EntityFrameworkCore;

public abstract class EntityLoader<
    DTO,
    [DynamicallyAccessedMembers(DynamicallyAccessedMemberTypes.All)] E
> : IEntityLoader<DTO, E> where DTO : IWithId where E : IEntity
{
    protected ISessionServiceMinimal sessionService;
    protected SessionDbContext db;

    public EntityLoader(
        ISessionServiceMinimal _sessionService,
        SessionDbContext _db
    )
    {
        sessionService = _sessionService;
        db = _db;
    }

    protected abstract Task<DTO> GetDTOFromEntity(E entity);

    public async Task<List<DTO>> GetAllDtos()
    {
        var entities = await GetAllEntities();

        return [.. await Task.WhenAll(entities.Values.Select(GetDTOFromEntity))];
    }

    public virtual async Task<Dictionary<string, DTO?>> GetDtosByIds(string[] ids)
    {
        var entities = await GetEntitiesByIds(ids);
        var dtos = await Task.WhenAll(entities
            .Select(async e => (
                e.Key,
                e.Value == null ? default : await GetDTOFromEntity(e.Value)
            ))
        );

        return dtos.ToDictionary();
    }

    public virtual async Task<Dictionary<string, E>> GetAllEntities()
    {
        var dbSet = await GetDbSet();

        // using var _ = LogUtil.Time($"{typeof(E)} - GetAllEntities");

        // Console.WriteLine($"{typeof(E).Name} - GetAllEntities - ContextId={db.ContextId}");
        return await dbSet
            .AsNoTracking()
            .ToDictionaryAsync(e => e.Id);
    }

    public virtual async Task<Dictionary<string, E?>> GetEntitiesByIds(string[] ids)
    {
        var dbSet = await GetDbSet();

        // using var _ = LogUtil.Time($"{typeof(E)} - GetEntitiesByIds");

        var found = await dbSet
            .Where(p => ids.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id);

        var result = new Dictionary<string, E?>(ids.Length);
        foreach (var id in ids)
        {
            found.TryGetValue(id, out var entity);
            result[id] = entity;
        }

        return result;
    }

    public async Task<DTO?> GetDto(string id)
    {
        var entity = await GetEntity(id);
        return entity == null ? default : await GetDTOFromEntity(entity);
    }

    public virtual async Task<E?> GetEntity(string id)
    {
        var dbSet = await GetDbSet();

        // using var _ = LogUtil.Time($"{typeof(E)} - GetEntity");

        return await dbSet.FindAsync(id);
    }

    public virtual async Task DeleteEntity(E entity)
    {
        var dbSet = await GetDbSet();

        // using var _ = LogUtil.Time($"{typeof(E)} - DeleteEntity");

        dbSet.Remove(entity);

        // required to remove entity from future queries
        await db.SaveChangesAsync();

        // Console.WriteLine($"Deleted {typeof(E)} id={entity.Id}");
    }

    public virtual async Task<E> AddEntity(E entity)
    {
        // Console.WriteLine($"{entity.GetType().Name} - Add id={entity.Id} - ContextId={db.ContextId}");

        var dbSet = await GetDbSet();

        // using var _ = LogUtil.Time($"{typeof(E)} - AddEntity");

        await dbSet.AddAsync(entity);
        // Console.WriteLine($"Context={db.ContextId}");
        await db.SaveChangesAsync();

        return entity;
    }

    public virtual async Task<IEnumerable<E>> AddEntities(IEnumerable<E> entities)
    {
        if (!entities.Any())
        {
            return entities;
        }

        // Console.WriteLine($"{typeof(E).Name} - Add multiple ({entities.Count()}) - ContextId={db.ContextId}");

        var dbSet = await GetDbSet();

        // using var _ = LogUtil.Time($"{typeof(E)} - AddEntities");

        await dbSet.AddRangeAsync(entities);
        await db.SaveChangesAsync();

        return entities;
    }

    public virtual async Task UpdateEntity(E entity)
    {
        // Console.WriteLine($"{entity.GetType().Name} - Update id={entity.Id} - ContextId={db.ContextId}");

        var dbSet = await GetDbSet();

        // using var _ = LogUtil.Time($"{typeof(E)} - UpdateEntity");

        dbSet.Update(entity);
        // Console.WriteLine($"Context={db.ContextId}");
        await db.SaveChangesAsync();
    }

    // public virtual async Task UpdateEntities(E[] entities)
    // {
    //     if (entities.Length == 0)
    //     {
    //         return;
    //     }

    //     Console.WriteLine($"{typeof(E).Name} - Update multiple ({entities.Length}) - ContextId={db.ContextId}");

    //     var dbSet = await GetDbSet();

    //     // using var _ = LogUtil.Time($"{typeof(E)} - UpdateEntities");

    //     dbSet.UpdateRange(entities);

    //     foreach (var entity in entities)
    //     {
    //         flags.Ids.Add(entity.Id);
    //     }
    // }

    public async Task<bool> Any()
    {
        var dbSet = await GetDbSet();

        // using var _ = LogUtil.Time($"{typeof(E)} - Any");

        return await dbSet.AnyAsync();
    }

    public async Task<E?> First()
    {
        var dbSet = await GetDbSet();

        // using var _ = LogUtil.Time($"{typeof(E)} - First");

        return await dbSet.FirstOrDefaultAsync();
    }

    public async Task<int> Count()
    {
        var dbSet = await GetDbSet();

        // using var _ = LogUtil.Time($"{typeof(E)} - Count");

        return await dbSet.CountAsync();
    }

    protected async Task<DbSet<E>> GetDbSet()
    {
        await sessionService.EnsureSessionCreated(db.ContextId.InstanceId);

        return GetDbSetRaw();
    }

    protected abstract DbSet<E> GetDbSetRaw();
}
