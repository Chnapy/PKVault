
public class EntityMemoryLoader<DTO, E> : EntityLoader<DTO, E> where DTO : IWithId<string>
{
    private List<DTO> dtoList;

    public EntityMemoryLoader(List<DTO> _dtoList)
    {
        dtoList = _dtoList;
    }

    public override List<DTO> GetAllDtos()
    {
        return [.. dtoList];
    }

    public override async Task SetAllDtos(List<DTO> nextEntities)
    {
        dtoList = nextEntities;

        HasWritten = true;
    }
}
