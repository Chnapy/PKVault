
public class EntityMemoryLoader<DTO, E>(
    Dictionary<string, E> entities,
    Func<E, DTO> entityToDto,
    Func<DTO, E> dtoToEntity
) : EntityLoader<DTO, E>(dtoToEntity, entityToDto) where DTO : IWithId<string> where E : IWithId<string>
{
    public override Dictionary<string, E> GetAllEntities()
    {
        return entities.ToDictionary();
    }

    public override void SetAllEntities(Dictionary<string, E> nextEntities)
    {
        entities = nextEntities.ToDictionary();

        HasWritten = true;
    }

    public override void WriteToFile()
    {
        throw new NotImplementedException();
    }
}
