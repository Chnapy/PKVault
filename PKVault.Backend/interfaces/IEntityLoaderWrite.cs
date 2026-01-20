public interface IEntityLoader<DTO, E> : IEntityLoaderWrite where DTO : IWithId where E : IEntity
{
    public List<DTO> GetAllDtos();
    public Dictionary<string, E> GetAllEntities();
    public DTO? GetDto(string id);
    public E? GetEntity(string id);
    public bool DeleteEntity(string id);
    public E WriteEntity(E entity);
    public int GetLastSchemaVersion();
}

public interface IEntityLoaderWrite
{
    public string FilePath { get; }
    public bool HasWritten { get; }

    public byte[] SerializeToUtf8Bytes();

    public void SetFlags(DataUpdateFlagsState<string> _flags);

    public Task WriteToFile();
}
