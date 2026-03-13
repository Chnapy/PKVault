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
                IdInt = (int)BoxType.Party,
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
                    IdInt = i,
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

        if (save.GetSave() is IDaycareStorage saveDaycare)
        {
            var id = ((int)BoxType.Daycare).ToString();
            var extraSlotsCount = extraSlots.FindAll(slot => slot.Type == StorageSlotType.Daycare).Count;
            boxes.Add(id, new()
            {
                Id = id,
                IdInt = (int)BoxType.Daycare,
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
                    IdInt = box,
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

        return boxes.Select(entry => (
            entry.Key,
            boxLoader.CreateDTO(entry.Value, GetWallpaperName(entry.Value.IdInt))
        )).ToDictionary();
    }

    public List<BoxDTO> GetAllDtos()
    {
        return [.. GetAllEntities().Values];
    }

    private string? GetWallpaperName(int box)
    {
        if (box < 0)
        {
            return null;
        }

        if (save.GetSave() is IBoxDetailWallpaper wp)
        {
            if (save.GetSave() is SAV9ZA)
            {
                return GetWallpaperResourceName(EntityContext.Gen8b.GetSingleGameVersion(), 1);
            }

            var wallpaper = wp.GetBoxWallpaper(box);
            return GetWallpaperResourceName(save.Version, wallpaper);
        }

        return null;
    }

    private static string GetWallpaperResourceName(GameVersion version, int index)
    {
        index++; // start indexes at 1
        var suffix = GetResourceSuffix(version, index);
        var variant = version switch
        {
            GameVersion.SL when index is 20 => "_n", // Naranja
            GameVersion.VL when index is 20 => "_u", // Uva
            _ => string.Empty,
        };

        return MatcherUtil.NormalizePath(
            Path.Combine(suffix, $"box_wp{index:00}{suffix}{variant}.png")
        );
    }

    private static string GetResourceSuffix(GameVersion version, int index) => version.Context switch
    {
        EntityContext.Gen3 when version == GameVersion.E => "e",
        EntityContext.Gen3 when GameVersion.FRLG.Contains(version) && index > 12 => "frlg",
        EntityContext.Gen3 => "rs",

        EntityContext.Gen4 when index <= 16 => "dp",
        EntityContext.Gen4 when version == GameVersion.Pt => "pt",
        EntityContext.Gen4 when GameVersion.HGSS.Contains(version) => "hgss",

        EntityContext.Gen5 => GameVersion.B2W2.Contains(version) && index > 16 ? "b2w2" : "bw",
        EntityContext.Gen6 => GameVersion.ORAS.Contains(version) && index > 16 ? "ao" : "xy",
        EntityContext.Gen7 => "xy", // roughly equivalent, only use X/Y's because they don't force checker-boxes.
        EntityContext.Gen8b => "bdsp",
        EntityContext.Gen8 => "swsh",
        EntityContext.Gen9 => "sv",
        _ => string.Empty,
    };

    public void WriteDto(BoxDTO dto)
    {
        if (!dto.CanSaveWrite)
        {
            throw new Exception("Not allowed for box type not default");
        }

        if (save.GetSave() is IBoxDetailName saveBoxName)
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
