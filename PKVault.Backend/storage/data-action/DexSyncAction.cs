using PKHeX.Core;

public class DexSyncAction(DexService dexService, uint[] saveIds) : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        if (saveIds.Length < 2)
        {
            throw new ArgumentException($"Saves IDs should be at least 2");
        }

        var saveLoaders = saveIds.Select<uint, SaveLoaders?>(id => id == FakeSaveFile.Default.ID32 ? null : loaders.saveLoadersDict[id]).ToList();

        var dex = await dexService.GetDex(saveIds);

        saveLoaders.ForEach(saveLoader =>
        {
            var service = DexService.GetDexService(saveLoader?.Save ?? new(FakeSaveFile.Default, ""), loaders);

            dex.ToList().ForEach(specEntry => specEntry.Value.Values.ToList().ForEach(entry =>
            {
                entry.Forms.ForEach(form =>
                {
                    service!.EnableSpeciesForm(entry.Species, form.Form, form.Gender, form.IsSeen, form.IsSeenShiny, form.IsCaught);
                });
            }));

            saveLoader?.Pkms.HasWritten = true;
        });

        flags.Dex = true;

        return new(
            type: DataActionType.DEX_SYNC,
            parameters: []
        );
    }
}
