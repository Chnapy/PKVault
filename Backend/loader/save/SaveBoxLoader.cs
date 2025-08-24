using PKHeX.Core;

public class SaveBoxLoader : EntityLoader<BoxDTO, object>
{
    private readonly SaveFile save;

    public SaveBoxLoader(SaveFile _save)
    {
        save = _save;
    }

    public override List<BoxDTO> GetAllDtos()
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

    public override async Task<BoxDTO> WriteDto(BoxDTO entity)
    {
        if (entity.Type != BoxType.Default)
        {
            throw new Exception("Not allowed for box type not default");
        }

        if (save is IBoxDetailName saveBoxName)
        {
            saveBoxName.SetBoxName(entity.IdInt, entity.Name);
            HasWritten = true;
        }

        return entity;
    }

    public override Task DeleteDto(string id)
    {
        throw new Exception($"Not implemented");
    }

    public override Task SetAllDtos(List<BoxDTO> entities)
    {
        throw new Exception($"Not implemented");
    }
}
