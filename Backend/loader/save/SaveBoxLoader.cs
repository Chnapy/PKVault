using PKHeX.Core;

public class SaveBoxLoader : EntityLoader<BoxDTO>
{
    private SaveFile save;

    public SaveBoxLoader(SaveFile _save)
    {
        save = _save;
    }

    public override List<BoxDTO> GetAllEntities()
    {
        var boxes = new List<BoxDTO>();

        if (save.HasParty)
        {
            boxes.Add(new BoxDTO
            {
                Id = "party",
                Type = BoxType.Party,
                Name = null
            });
        }

        if (save is IDaycareStorage)
        {
            boxes.Add(new BoxDTO
            {
                Id = "daycare",
                Type = BoxType.Daycare,
                Name = null
            });
        }

        var boxesNames = BoxUtil.GetBoxNames(save).ToList();
        for (int i = 0; i < boxesNames.Count; i++)
        {
            boxes.Add(new BoxDTO
            {
                Id = i.ToString(),
                Type = BoxType.Default,
                Name = boxesNames[i]
            });
        }

        return boxes;
    }

    public override BoxDTO WriteEntity(BoxDTO entity)
    {
        if (entity.Type != BoxType.Default)
        {
            throw new Exception("Not allowed for box type not default");
        }

        if (save is IBoxDetailName saveBoxName)
        {
            saveBoxName.SetBoxName(entity.IdInt, entity.Name);
        }

        return entity;
    }

    public override BoxDTO? DeleteEntity(string id)
    {
        throw new Exception($"Not implemented");
    }

    public override void SetAllEntities(List<BoxDTO> entities)
    {
        throw new Exception($"Not implemented");
    }
}
