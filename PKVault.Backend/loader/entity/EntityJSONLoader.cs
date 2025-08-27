
using System.Text.Json;

public class EntityJSONLoader<DTO, E> : EntityLoader<DTO, E> where DTO : IWithId<string> where E : IWithId<string>
{
    public static async Task<EntityJSONLoader<DTO, E>> Create(
        string filePath,
        Func<E, Task<DTO>> entityToDto,
        Func<DTO, E> dtoToEntity
    )
    {
        if (!File.Exists(filePath))
        {
            Console.WriteLine($"Entity DB file not existing: creating {filePath}");
            string emptyJson = JsonSerializer.Serialize(new List<E>());

            string? directory = Path.GetDirectoryName(filePath);
            if (!string.IsNullOrEmpty(directory))
            {
                Directory.CreateDirectory(directory);
            }

            File.WriteAllText(filePath, emptyJson);
        }

        string json = File.ReadAllText(filePath);
        var entityList = JsonSerializer.Deserialize<List<E>>(json) ?? [];
        var dtoList = (await Task.WhenAll(entityList.Select(entityToDto))).ToList();

        return new EntityJSONLoader<DTO, E>(filePath, dtoToEntity, dtoList);
    }

    private string filePath;
    private Func<DTO, E> dtoToEntity;
    protected List<DTO> dtoList;

    private EntityJSONLoader(
        string _filePath, Func<DTO, E> _dtoToEntity, List<DTO> _dtoList
    )
    {
        filePath = _filePath;
        dtoToEntity = _dtoToEntity;
        dtoList = _dtoList;
    }

    public override List<DTO> GetAllDtos()
    {
        return [.. dtoList];
    }

    public override List<E> GetAllEntities()
    {
        return dtoList.Select(dtoToEntity).ToList();
    }

    public override async Task SetAllDtos(List<DTO> dtos)
    {
        dtoList = [.. dtos];

        var entityList = dtos.Select(dtoToEntity).ToList();

        Console.WriteLine($"Write entities to {filePath}");

        File.WriteAllText(filePath, JsonSerializer.Serialize(entityList));

        HasWritten = true;
    }
}
