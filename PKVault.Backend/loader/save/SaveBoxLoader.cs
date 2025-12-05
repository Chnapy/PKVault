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
                Type = BoxType.Party,
                BoxEntity = new()
                {
                    Id = id,
                    Name = BoxType.Party.ToString(),
                    Order = currentOrder,
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
                    Type = BoxType.Box,
                    SlotCountVariable = save.BoxSlotCount,
                    BoxEntity = new()
                    {
                        Id = id,
                        Name = boxesNames[i],
                        Order = currentOrder,
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
                Type = BoxType.Daycare,
                SlotCountVariable = saveDaycare.DaycareSlotCount + extraSlotsCount,
                BoxEntity = new()
                {
                    Id = id,
                    Name = BoxType.Daycare.ToString(),
                    Order = currentOrder,
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
                    Type = boxType,
                    SlotCountVariable = slotCount,
                    BoxEntity = new()
                    {
                        Id = id,
                        Name = name,
                        Order = currentOrder,
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
        if (!dto.CanWrite)
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
