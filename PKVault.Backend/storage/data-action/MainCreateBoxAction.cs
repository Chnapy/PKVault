public record MainCreateBoxActionInput(
    string bankId, int? slotCount
);

public class MainCreateBoxAction(IBoxLoader boxLoader) : DataAction<MainCreateBoxActionInput>
{
    protected override async Task<DataActionPayload> Execute(MainCreateBoxActionInput input, DataUpdateFlags flags)
    {
        var dto = CreateBox(input);

        return new(
            type: DataActionType.MAIN_CREATE_BOX,
            parameters: [dto.Name]
        );
    }

    public BoxEntity CreateBox(MainCreateBoxActionInput input)
    {
        var allBoxes = boxLoader.GetAllEntities().Values.ToList();
        var boxes = allBoxes.FindAll(box => box.BankId == input.bankId);
        var maxId = allBoxes.Max(box => int.Parse(box.Id));
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

        var entity = boxLoader.WriteEntity(new(
            Id: id.ToString(),
            Type: BoxType.Box,
            Name: name,
            SlotCount: input.slotCount ?? 30,
            Order: order,
            BankId: input.bankId
        ));
        boxLoader.NormalizeOrders();

        return entity;
    }
}
