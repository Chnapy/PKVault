
public class EntityMemoryLoader<DTO, E>(
    List<E> entityList,
    Func<E, Task<DTO>> entityToDto,
    Func<DTO, E> dtoToEntity
) : EntityLoader<DTO, E>(dtoToEntity, entityToDto) where DTO : IWithId<string> where E : IWithId<string>
{
    public override List<E> GetAllEntities()
    {
        return [.. entityList];
    }

    public override void SetAllEntities(List<E> nextEntities)
    {
        entityList = [.. nextEntities];

        HasWritten = true;
    }
}
