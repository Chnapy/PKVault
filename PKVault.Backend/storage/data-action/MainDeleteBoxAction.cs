public record MainDeleteBoxActionInput(string boxId);

public class MainDeleteBoxAction(IBoxLoader boxLoader, IBankLoader bankLoader, IPkmVersionLoader pkmVersionLoader) : DataAction<MainDeleteBoxActionInput>
{
    protected override async Task<DataActionPayload> Execute(MainDeleteBoxActionInput input, DataUpdateFlags flags)
    {
        var box = await boxLoader.GetEntity(input.boxId);
        var idInt = int.Parse(box.Id);
        var boxPkms = await pkmVersionLoader.GetEntitiesByBox(idInt);

        if (!boxPkms.IsEmpty)
        {
            throw new ArgumentException($"Cannot delete box with pkm inside");
        }

        await boxLoader.DeleteEntity(box);
        await boxLoader.NormalizeOrders();

        if (box.BankId != null)
        {
            var bank = await bankLoader.GetEntity(box.BankId);
            if (bank.View.MainBoxIds.Contains(idInt))
            {
                bank.View = new(
                    MainBoxIds: [.. bank.View.MainBoxIds.ToList().FindAll(id => id != idInt)],
                    Saves: bank.View.Saves
                );
                await bankLoader.UpdateEntity(bank);
            }
        }

        return new(
            type: DataActionType.MAIN_DELETE_BOX,
            parameters: [box!.Name]
        );
    }
}
