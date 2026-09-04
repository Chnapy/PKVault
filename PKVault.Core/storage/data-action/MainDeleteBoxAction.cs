public record MainDeleteBoxActionInput(string boxId);

public class MainDeleteBoxAction(IBoxLoader boxLoader, IBankLoader bankLoader) : DataAction<MainDeleteBoxActionInput>
{
    protected override async Task<DataActionPayload> Execute(MainDeleteBoxActionInput input, DataUpdateFlags flags)
    {
        var box = await boxLoader.GetEntity(input.boxId);

        await boxLoader.DeleteEntity(box);
        await boxLoader.NormalizeOrders();

        var bank = await bankLoader.GetEntity(box.BankId);
        if (bank.View.MainBoxIds.Contains(box.IdInt))
        {
            bank.View = new(
                MainBoxIds: [.. bank.View.MainBoxIds.ToList().FindAll(id => id != box.IdInt)],
                Saves: bank.View.Saves
            );
            await bankLoader.UpdateEntity(bank);
        }

        return new(
            type: DataActionType.MAIN_DELETE_BOX,
            parameters: [box!.Name]
        );
    }
}
