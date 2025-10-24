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
            var id = (-(int)StorageSlotType.Party).ToString();
            boxes.Add(id, new BoxDTO
            {
                Type = StorageSlotType.Party,
                BoxEntity = new()
                {
                    Id = id,
                    Name = StorageSlotType.Party.ToString(),
                }
            });
        }

        if (save.HasBox)
        {
            var boxesNames = BoxUtil.GetBoxNames(save).ToList();
            for (int i = 0; i < boxesNames.Count; i++)
            {
                var id = i.ToString();
                boxes.Add(id, new BoxDTO
                {
                    Type = StorageSlotType.Box,
                    SlotCountVariable = save.BoxSlotCount,
                    BoxEntity = new()
                    {
                        Id = id,
                        Name = boxesNames[i],
                    }
                });
            }
        }

        var extraSlots = save.GetExtraSlots(true);

        if (save is IDaycareStorage saveDaycare)
        {
            var id = (-(int)StorageSlotType.Daycare).ToString();
            var extraSlotsCount = extraSlots.FindAll(slot => slot.Type == StorageSlotType.Daycare).Count;
            boxes.Add(id, new BoxDTO
            {
                Type = StorageSlotType.Daycare,
                SlotCountVariable = saveDaycare.DaycareSlotCount + extraSlotsCount,
                BoxEntity = new()
                {
                    Id = id,
                    Name = StorageSlotType.Daycare.ToString(),
                }
            });
        }

        extraSlots
            .Select(slot => slot.Type)
            .Distinct()
            .ToList()
            .FindAll(slotType => slotType != StorageSlotType.Daycare)
            .ForEach((slotType) =>
            {
                int box = slotType switch
                {
                    StorageSlotType.None => -1,
                    StorageSlotType.Box => throw new NotImplementedException(),
                    _ => -(int)slotType,
                };
                var id = box.ToString();
                var name = slotType.ToString();
                var slotCount = extraSlots.FindAll(slot => slot.Type == slotType).Count;

                boxes.Add(id, new BoxDTO
                {
                    Type = slotType,
                    SlotCountVariable = slotCount,
                    BoxEntity = new()
                    {
                        Id = id,
                        Name = name,
                    }
                });
            });

        return boxes;
    }

    public override void WriteDto(BoxDTO dto)
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
