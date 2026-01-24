using System.Collections.Immutable;

public interface IEntityLoader<DTO, E> : IEntityLoaderWrite where DTO : IWithId where E : IEntity
{
    public Task<List<DTO>> GetAllDtos();
    public ImmutableDictionary<string, E> GetAllEntities();
    public Task<DTO?> GetDto(string id);
    public E? GetEntity(string id);
    public bool DeleteEntity(string id);
    public E WriteEntity(E entity);
}

public interface IEntityLoaderWrite
{
    public bool HasWritten { get; }

    public void SetFlags(DataUpdateFlagsState<string> _flags);
}
