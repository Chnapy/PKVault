public class MainDeleteBoxAction(string boxId) : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        var box = loaders.boxLoader.GetDto(boxId);
        var allPkms = loaders.pkmLoader.GetAllEntities().Values;

        if (allPkms.Any(pkm => pkm.BoxId == box!.IdInt))
        {
            throw new ArgumentException($"Cannot delete box with pkm inside");
        }

        loaders.boxLoader.DeleteEntity(boxId);
        loaders.boxLoader.NormalizeOrders();

        if (box.BankId != null)
        {
            var bank = loaders.bankLoader.GetEntity(box.BankId);
            if (bank.View.MainBoxIds.Contains(box.IdInt))
            {
                loaders.bankLoader.WriteEntity(bank with
                {
                    View = new(
                        MainBoxIds: [.. bank.View.MainBoxIds.ToList().FindAll(id => id != box.IdInt)],
                        Saves: bank.View.Saves
                    )
                });
            }
        }

        return new()
        {
            type = DataActionType.MAIN_DELETE_BOX,
            parameters = [box!.Name]
        };
    }
}
