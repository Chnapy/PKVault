public record MainCreateBoxActionInput(
    string bankId, int? slotCount
);

public class MainCreateBoxAction(IBoxLoader boxLoader) : DataAction<MainCreateBoxActionInput>
{
    protected override async Task<DataActionPayload> Execute(MainCreateBoxActionInput input, DataUpdateFlags flags)
    {
        var dto = await CreateBox(input);

        return new(
            type: DataActionType.MAIN_CREATE_BOX,
            parameters: [dto.Name]
        );
    }

    public async Task<BoxEntity> CreateBox(MainCreateBoxActionInput input)
    {
        var boxes = await boxLoader.GetEntitiesByBank(input.bankId);
        var maxId = await boxLoader.GetMaxId();
        var maxOrder = boxes.Count == 0 ? 0 : boxes.Values.Max(box => box.Order);

        string GetNewName()
        {
            var i = boxes.Count + 1;

            while (boxes.Values.Any(box => box.Name == $"Box {i}"))
            {
                i++;
            }

            return $"Box {i}";
        }

        var id = maxId + 1;
        var order = maxOrder + 1;
        var name = GetNewName();

        var entity = await boxLoader.AddEntity(new()
        {
            Id = id.ToString(),
            IdInt = id,
            Type = BoxType.Box,
            Name = name,
            SlotCount = input.slotCount ?? 30,
            Order = order,
            BankId = input.bankId
        });
        await boxLoader.NormalizeOrders();

        return entity;
    }
}
