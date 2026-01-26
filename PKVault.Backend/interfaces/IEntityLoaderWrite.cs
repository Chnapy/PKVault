public interface IEntityLoader<DTO, E> : IEntityLoaderWrite where DTO : IWithId where E : IEntity
{
    public Task<List<DTO>> GetAllDtos();
    public Task<Dictionary<string, E>> GetAllEntities();
    public Task<DTO?> GetDto(string id);
    public Task<E?> GetEntity(string id);
    public Task DeleteEntity(E entity);
    public Task<E> AddEntity(E entity);
    public Task UpdateEntity(E entity);
    public Task<E> First();
    public Task<int> Count();
}

public interface IEntityLoaderWrite
{
    public void SetFlags(DataUpdateFlagsState<string> _flags);
}
