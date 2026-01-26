using System.Collections.Immutable;
using Microsoft.EntityFrameworkCore;

public abstract class EntityLoader<DTO, E> : IEntityLoader<DTO, E> where DTO : IWithId where E : IEntity
{
    protected IFileIOService fileIOService;
    protected SessionService sessionService;
    protected SessionDbContext db;
    private DataUpdateFlagsState<string> flags;

    public bool HasWritten { get; set; } = false;

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

    public virtual async Task<ImmutableDictionary<string, E>> GetAllEntities()
    {
        var dbSet = await GetDbSet();

        // Console.WriteLine($"{typeof(E).Name} - GetAllEntities - ContextId={db.ContextId}");
        db.ChangeTracker.Clear();
        return dbSet
            .AsNoTracking()
            .ToImmutableDictionary(e => e.Id, e => e);
    }

    public async Task<DTO?> GetDto(string id)
    {
        var entity = await GetEntity(id);
        return entity == null ? default : await GetDTOFromEntity(entity);
    }

    public virtual async Task<E?> GetEntity(string id)
    {
        var dbSet = await GetDbSet();

        db.ChangeTracker.Clear();
        return await dbSet.FindAsync(id);
    }

    public virtual async Task<bool> DeleteEntity(string id)
    {
        var dbSet = await GetDbSet();

        var existingEntity = await GetEntity(id);
        if (existingEntity != null)
        {
            db.ChangeTracker.Clear();
            dbSet.Remove(existingEntity);
            await SaveChanges();

            flags.Ids.Add(id);
            HasWritten = true;
            Console.WriteLine($"Deleted {typeof(E)} id={id}");
            return true;
        }
        return false;
    }

    public virtual async Task<E> WriteEntity(E entity)
    {
        Console.WriteLine($"{entity.GetType().Name} - Write id={entity.Id} - ContextId={db.ContextId}");

        var dbSet = await GetDbSet();

        if (await GetEntity(entity.Id) != null)
        {
            db.ChangeTracker.Clear();
            dbSet.Update(entity);
        }
        else
        {
            db.ChangeTracker.Clear();
            dbSet.Add(entity);
        }
        await SaveChanges();
        // Console.WriteLine($"Context={db.ContextId}");

        flags.Ids.Add(entity.Id);
        HasWritten = true;

        return entity;
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
