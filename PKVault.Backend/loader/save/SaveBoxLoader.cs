using PKHeX.Core;

public class SaveBoxLoader(SaveFile save) : EntityLoader<BoxDTO, BoxDTO>(
    dtoToEntity: item => item,
    entityToDto: async item => item
)
{
    public override List<BoxDTO> GetAllEntities()
    {
        var boxes = new List<BoxDTO>();

        if (save.HasParty)
        {
            boxes.Add(new BoxDTO
            {
                Type = BoxType.Party,
                BoxEntity = new()
                {
                    Id = BoxDTO.PARTY_ID.ToString(),
                    Name = "Party",
                }
            });
        }

        if (save is IDaycareStorage)
        {
            boxes.Add(new BoxDTO
            {
                Type = BoxType.Daycare,
                BoxEntity = new()
                {
                    Id = BoxDTO.DAYCARE_ID.ToString(),
                    Name = "Daycare",
                }
            });
        }

        var boxesNames = BoxUtil.GetBoxNames(save).ToList();
        for (int i = 0; i < boxesNames.Count; i++)
        {
            boxes.Add(new BoxDTO
            {
                Type = BoxType.Default,
                BoxEntity = new()
                {
                    Id = i.ToString(),
                    Name = boxesNames[i],
                }
            });
        }

        return boxes;
    }

    public override void WriteDto(BoxDTO dto)
    {
        if (dto.Type != BoxType.Default)
        {
            throw new Exception("Not allowed for box type not default");
        }

        if (save is IBoxDetailName saveBoxName)
        {
            saveBoxName.SetBoxName(dto.IdInt, dto.Name);
            HasWritten = true;
        }
    }

    public override void DeleteEntity(string id)
    {
        throw new Exception($"Not implemented");
    }

    public override void SetAllEntities(List<BoxDTO> entities)
    {
        throw new Exception($"Not implemented");
    }
}
