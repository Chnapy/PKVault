public record MainDeleteBoxActionInput(string boxId);

public class MainDeleteBoxAction(IBoxLoader boxLoader, IBankLoader bankLoader, IPkmVersionLoader pkmVersionLoader) : DataAction<MainDeleteBoxActionInput>
{
    protected override async Task<DataActionPayload> Execute(MainDeleteBoxActionInput input, DataUpdateFlags flags)
    {
        var box = await boxLoader.GetDto(input.boxId);
        var boxPkms = await pkmVersionLoader.GetEntitiesByBox(box!.IdInt);

        if (!boxPkms.IsEmpty)
        {
            throw new ArgumentException($"Cannot delete box with pkm inside");
        }

        await boxLoader.DeleteEntity(input.boxId);
        await boxLoader.NormalizeOrders();

        if (box.BankId != null)
        {
            var bank = await bankLoader.GetEntity(box.BankId);
            if (bank.View.MainBoxIds.Contains(box.IdInt))
            {
                await bankLoader.WriteEntity(bank with
                {
                    View = new(
                        MainBoxIds: [.. bank.View.MainBoxIds.ToList().FindAll(id => id != box.IdInt)],
                        Saves: bank.View.Saves
                    )
                });
            }
        }

        return new(
            type: DataActionType.MAIN_DELETE_BOX,
            parameters: [box!.Name]
        );
    }
}
