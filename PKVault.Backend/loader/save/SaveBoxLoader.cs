using PKHeX.Core;

public class SaveBoxLoader(SaveFile save) : EntityLoader<BoxDTO, BoxDTO>(
    dtoToEntity: item => item,
    entityToDto: item => item
)
{
    public override Dictionary<string, BoxDTO> GetAllEntities()
    {
        var boxes = new Dictionary<string, BoxDTO>();

        if (save.HasParty)
        {
            var id = BoxDTO.PARTY_ID.ToString();
            boxes.Add(id, new BoxDTO
            {
                Type = BoxType.Party,
                BoxEntity = new()
                {
                    Id = id,
                    Name = "Party",
                }
            });
        }

        if (save is IDaycareStorage saveDaycare)
        {
            var id = BoxDTO.DAYCARE_ID.ToString();
            boxes.Add(id, new BoxDTO
            {
                Type = BoxType.Daycare,
                SlotCountVariable = saveDaycare.DaycareSlotCount,
                BoxEntity = new()
                {
                    Id = id,
                    Name = "Daycare",
                }
            });
        }

        var boxesNames = BoxUtil.GetBoxNames(save).ToList();
        for (int i = 0; i < boxesNames.Count; i++)
        {
            var id = i.ToString();
            boxes.Add(id, new BoxDTO
            {
                Type = BoxType.Default,
                SlotCountVariable = save.BoxSlotCount,
                BoxEntity = new()
                {
                    Id = id,
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

    public override bool DeleteEntity(string id)
    {
        throw new Exception($"Not implemented");
    }

    public override void SetAllEntities(Dictionary<string, BoxDTO> entities)
    {
        throw new Exception($"Not implemented");
    }

    public override void WriteToFile()
    {
        throw new NotImplementedException();
    }
}
