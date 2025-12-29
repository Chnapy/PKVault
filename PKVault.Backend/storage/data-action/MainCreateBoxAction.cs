public class MainCreateBoxAction(string bankId, int? slotCount) : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var dto = CreateBox(loaders, flags, bankId, slotCount);

        return new()
        {
            type = DataActionType.MAIN_CREATE_BOX,
            parameters = [dto.Name]
        };
    }

    public static BoxDTO CreateBox(DataEntityLoaders loaders, DataUpdateFlags flags, string bankId, int? slotCount)
    {
        var allBoxes = loaders.boxLoader.GetAllEntities().Values.ToList();
        var boxes = allBoxes.FindAll(box => box.BankId == bankId);
        var maxId = allBoxes.Max(box => box.IdInt);
        var maxOrder = boxes.Count == 0 ? 0 : boxes.Max(box => box.Order);

        string GetNewName()
        {
            var i = boxes.Count + 1;

            while (boxes.Any(box => box.Name == $"Box {i}"))
            {
                i++;
            }

            return $"Box {i}";
        }

        var id = maxId + 1;
        var order = maxOrder + 1;
        var name = GetNewName();

        BoxDTO dto = new()
        {
            BoxEntity = new()
            {
                Id = id.ToString(),
                Name = name,
                SlotCount = slotCount ?? 30,
                Order = order,
                BankId = bankId
            }
        };

        loaders.boxLoader.WriteDto(dto);

        NormalizeBoxOrders(loaders.boxLoader);

        flags.MainBoxes = true;
        flags.MainBanks = true;

        return dto;
    }

    public static void NormalizeBoxOrders(BoxLoader boxLoader)
    {
        var boxes = boxLoader.GetAllEntities();

        var bi = 0;
        string? bankId = null;
        boxes.Values
            .OrderBy(box => box.BankId)
            .ThenBy(box => box.Order).ToList()
            .ForEach(box =>
            {
                if (bankId != box.BankId)
                {
                    bankId = box.BankId;
                    bi = 0;
                }

                if (box.Order != bi)
                {
                    box.Order = bi;
                    boxLoader.WriteEntity(box);
                }
                bi += 10;
            });
    }
}
