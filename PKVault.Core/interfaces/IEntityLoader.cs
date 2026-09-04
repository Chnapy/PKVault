public interface IEntityLoader<DTO, E> where DTO : IWithId where E : IEntity
{
    public Task<List<DTO>> GetAllDtos();
    public Task<Dictionary<string, E>> GetAllEntities();
    public Task<Dictionary<string, DTO?>> GetDtosByIds(string[] ids);
    public Task<Dictionary<string, E?>> GetEntitiesByIds(string[] ids);
    public Task<DTO?> GetDto(string id);
    public Task<E?> GetEntity(string id);
    public Task DeleteEntity(E entity);
    public Task<E> AddEntity(E entity);
    public Task UpdateEntity(E entity);
    public Task<IEnumerable<E>> AddEntities(IEnumerable<E> entities);
    public Task<bool> Any();
    public Task<E?> First();
    public Task<int> Count();
}
