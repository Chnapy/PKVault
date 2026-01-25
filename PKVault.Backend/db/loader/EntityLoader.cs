using System.Collections.Immutable;
using Microsoft.EntityFrameworkCore;

public abstract class EntityLoader<DTO, E> : IEntityLoader<DTO, E> where DTO : IWithId where E : IEntity
{
    protected IFileIOService fileIOService;
    protected SessionDbContext db;
    private DataUpdateFlagsState<string> flags;

    public bool HasWritten { get; set; } = false;

    public EntityLoader(
        IFileIOService _fileIOService,
        SessionDbContext _db,
        DataUpdateFlagsState<string> _flags
    )
    {
        fileIOService = _fileIOService;
        db = _db;
        flags = _flags;
    }

    protected abstract Task<DTO> GetDTOFromEntity(E entity);

    public async Task<List<DTO>> GetAllDtos()
    {
        return [.. await Task.WhenAll(GetAllEntities().Values.Select(GetDTOFromEntity))];
    }

    public virtual ImmutableDictionary<string, E> GetAllEntities()
    {
        // Console.WriteLine($"{typeof(E).Name} - GetAllEntities - ContextId={db.ContextId}");
        db.ChangeTracker.Clear();
        return GetDbSet()
            .AsNoTracking()
            .ToImmutableDictionary(e => e.Id, e => e);
    }

    public async Task<DTO?> GetDto(string id)
    {
        var entity = GetEntity(id);
        return entity == null ? default : await GetDTOFromEntity(entity);
    }

    public virtual E? GetEntity(string id)
    {
        db.ChangeTracker.Clear();
        return GetDbSet().Find(id);
    }

    public virtual bool DeleteEntity(string id)
    {
        var existingEntity = GetEntity(id);
        if (existingEntity != null)
        {
            db.ChangeTracker.Clear();
            GetDbSet().Remove(existingEntity);
            SaveChanges();

            flags.Ids.Add(id);
            HasWritten = true;
            Console.WriteLine($"Deleted {typeof(E)} id={id}");
            return true;
        }
        return false;
    }

    public virtual E WriteEntity(E entity)
    {
        Console.WriteLine($"{entity.GetType().Name} - Write id={entity.Id} - ContextId={db.ContextId}");

        if (GetEntity(entity.Id) != null)
        {
            db.ChangeTracker.Clear();
            GetDbSet().Update(entity);
        }
        else
        {
            db.ChangeTracker.Clear();
            GetDbSet().Add(entity);
        }
        SaveChanges();
        // Console.WriteLine($"Context={db.ContextId}");

        flags.Ids.Add(entity.Id);
        HasWritten = true;

        return entity;
    }

    public void SaveChanges()
    {
        db.SaveChanges();
    }

    public void SetFlags(DataUpdateFlagsState<string> _flags)
    {
        flags = _flags;
    }

    protected abstract DbSet<E> GetDbSet();
}
