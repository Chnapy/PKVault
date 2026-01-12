public class MainCreateBoxAction(string bankId, int? slotCount) : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var dto = CreateBox(loaders, flags, bankId, slotCount);

        return new(
            type: DataActionType.MAIN_CREATE_BOX,
            parameters: [dto.Name]
        );
    }

    public static BoxEntity CreateBox(DataEntityLoaders loaders, DataUpdateFlags flags, string bankId, int? slotCount)
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

        var entity = loaders.boxLoader.WriteEntity(new(
            SchemaVersion: loaders.boxLoader.GetLastSchemaVersion(),
            Id: id.ToString(),
            Type: BoxType.Box,
            Name: name,
            SlotCount: slotCount ?? 30,
            Order: order,
            BankId: bankId
        ));
        loaders.boxLoader.NormalizeOrders();

        return entity;
    }
}
