using System.Collections.Immutable;

public interface IEntityLoader<DTO, E> : IEntityLoaderWrite where DTO : IWithId where E : IEntity
{
    public Task<List<DTO>> GetAllDtos();
    public Task<ImmutableDictionary<string, E>> GetAllEntities();
    public Task<DTO?> GetDto(string id);
    public Task<E?> GetEntity(string id);
    public Task<bool> DeleteEntity(string id);
    public Task<E> WriteEntity(E entity);
}

public interface IEntityLoaderWrite
{
    public bool HasWritten { get; }

    public void SetFlags(DataUpdateFlagsState<string> _flags);
}
