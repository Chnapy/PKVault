using PKHeX.Core;

public interface ISaveBoxLoader
{
    public bool HasWritten { get; set; }

    public Dictionary<string, BoxDTO> GetAllEntities();
    public List<BoxDTO> GetAllDtos();
    public void WriteDto(BoxDTO dto);
    public BoxDTO? GetDto(string id);
}

public class SaveBoxLoader(SaveWrapper save, IServiceProvider sp) : ISaveBoxLoader
{
    public bool HasWritten { get; set; } = false;

    public Dictionary<string, BoxDTO> GetAllEntities()
    {
        var boxes = new Dictionary<string, BoxEntity>();

        var currentOrder = 0;

        if (save.HasParty)
        {
            var id = ((int)BoxType.Party).ToString();
            boxes.Add(id, new()
            {
                Id = id,
                Type = BoxType.Party,
                Name = BoxType.Party.ToString(),
                Order = currentOrder,
                SlotCount = 6,
                BankId = ""
            });
            currentOrder++;
        }

        if (save.HasBox)
        {
            var boxesNames = save.GetBoxNames();
            for (int i = 0; i < boxesNames.Count; i++)
            {
                var id = i.ToString();
                boxes.Add(id, new()
                {
                    Id = id,
                    Type = BoxType.Box,
                    Name = boxesNames[i],
                    Order = currentOrder,
                    SlotCount = save.BoxSlotCount,
                    BankId = ""
                });
                currentOrder++;
            }
        }

        var extraSlots = save.GetSave().GetExtraSlots(true);

        if (save is IDaycareStorage saveDaycare)
        {
            var id = ((int)BoxType.Daycare).ToString();
            var extraSlotsCount = extraSlots.FindAll(slot => slot.Type == StorageSlotType.Daycare).Count;
            boxes.Add(id, new()
            {
                Id = id,
                Type = BoxType.Daycare,
                Name = BoxType.Daycare.ToString(),
                Order = currentOrder,
                SlotCount = saveDaycare.DaycareSlotCount + extraSlotsCount,
                BankId = ""
            });
            currentOrder++;
        }

        extraSlots
            .Select(slot => BoxLoader.GetTypeFromStorageSlotType(slot.Type))
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
                var slotCount = extraSlots.FindAll(slot => BoxLoader.GetTypeFromStorageSlotType(slot.Type) == boxType).Count;

                boxes.Add(id, new()
                {
                    Id = id,
                    Type = boxType,
                    Name = name,
                    Order = currentOrder,
                    SlotCount = slotCount,
                    BankId = ""
                });
                currentOrder++;
            });

        using var scope = sp.CreateScope();
        var boxLoader = scope.ServiceProvider.GetRequiredService<IBoxLoader>();

        return boxes.Select(entry => (entry.Key, boxLoader.CreateDTO(entry.Value))).ToDictionary();
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
