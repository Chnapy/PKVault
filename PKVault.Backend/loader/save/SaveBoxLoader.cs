using PKHeX.Core;

public class SaveBoxLoader(SaveFile save)
{
    public bool HasWritten = false;

    public Dictionary<string, BoxDTO> GetAllEntities()
    {
        var boxes = new Dictionary<string, BoxDTO>();

        var currentOrder = 0;

        if (save.HasParty)
        {
            var id = ((int)BoxType.Party).ToString();
            boxes.Add(id, new BoxDTO
            {
                BoxEntity = new()
                {
                    Id = id,
                    Type = BoxType.Party,
                    Name = BoxType.Party.ToString(),
                    Order = currentOrder,
                    SlotCount = 6,
                }
            });
            currentOrder++;
        }

        if (save.HasBox)
        {
            var boxesNames = BoxUtil.GetBoxNames(save).ToList();
            for (int i = 0; i < boxesNames.Count; i++)
            {
                var id = i.ToString();
                boxes.Add(id, new BoxDTO
                {
                    BoxEntity = new()
                    {
                        Id = id,
                        Type = BoxType.Box,
                        Name = boxesNames[i],
                        Order = currentOrder,
                        SlotCount = save.BoxSlotCount,
                    }
                });
                currentOrder++;
            }
        }

        var extraSlots = save.GetExtraSlots(true);

        if (save is IDaycareStorage saveDaycare)
        {
            var id = ((int)BoxType.Daycare).ToString();
            var extraSlotsCount = extraSlots.FindAll(slot => slot.Type == StorageSlotType.Daycare).Count;
            boxes.Add(id, new BoxDTO
            {
                BoxEntity = new()
                {
                    Id = id,
                    Type = BoxType.Daycare,
                    Name = BoxType.Daycare.ToString(),
                    Order = currentOrder,
                    SlotCount = saveDaycare.DaycareSlotCount + extraSlotsCount,
                }
            });
            currentOrder++;
        }

        extraSlots
            .Select(slot => BoxDTO.GetTypeFromStorageSlotType(slot.Type))
            .Distinct()
            .ToList()
            .FindAll(slotType => slotType != BoxType.Daycare)
            .ForEach((boxType) =>
            {
                int box = boxType switch
                {
                    BoxType.Box => throw new NotImplementedException(),
                    _ => (int)boxType,
                };
                var id = box.ToString();
                var name = boxType.ToString();
                var slotCount = extraSlots.FindAll(slot => BoxDTO.GetTypeFromStorageSlotType(slot.Type) == boxType).Count;

                boxes.Add(id, new BoxDTO
                {
                    BoxEntity = new()
                    {
                        Id = id,
                        Type = boxType,
                        Name = name,
                        Order = currentOrder,
                        SlotCount = slotCount,
                    }
                });
                currentOrder++;
            });

        return boxes;
    }

    public List<BoxDTO> GetAllDtos()
    {
        return [.. GetAllEntities().Values];
    }

    public void WriteDto(BoxDTO dto)
    {
        if (!dto.CanSaveWrite)
        {
            throw new Exception("Not allowed for box type not default");
        }

        if (save is IBoxDetailName saveBoxName)
        {
            saveBoxName.SetBoxName(dto.IdInt, dto.Name);
            HasWritten = true;
        }
    }

    public BoxDTO? GetDto(string id)
    {
        var entities = GetAllEntities();
        if (entities.TryGetValue(id, out var value))
        {
            return value;
        }
        return default;
    }
}
