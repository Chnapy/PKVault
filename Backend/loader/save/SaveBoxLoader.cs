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
        var boxesNames = BoxUtil.GetBoxNames(save).ToList();

        var boxes = new List<BoxDTO>();
        for (int i = 0; i < boxesNames.Count; i++)
        {
            boxes.Add(new BoxDTO
            {
                Id = i.ToString(),
                Name = boxesNames[i]
            });
        }

        return boxes;
    }

    public override BoxDTO WriteEntity(BoxDTO entity)
    {
        (save as IBoxDetailName)?.SetBoxName(entity.IdInt, entity.Name);
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
