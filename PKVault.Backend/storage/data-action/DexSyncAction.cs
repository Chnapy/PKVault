using PKHeX.Core;

public record DexSyncActionInput(uint[] saveIds);

public class DexSyncAction(
    DexService dexService,
    ISavesLoadersService savesLoadersService
) : DataAction<DexSyncActionInput>
{
    protected override async Task<DataActionPayload> Execute(DexSyncActionInput input, DataUpdateFlags flags)
    {
        if (input.saveIds.Length < 2)
        {
            throw new ArgumentException($"Saves IDs should be at least 2");
        }

        var saveLoaders = input.saveIds.Select(id => id == FakeSaveFile.Default.ID32
            ? null
            : savesLoadersService.GetLoaders(id)
        ).ToList();

        var dex = await dexService.GetDex(input.saveIds);

        saveLoaders.ForEach(saveLoader =>
        {
            var service = dexService.GetDexService(saveLoader?.Save ?? new(FakeSaveFile.Default));

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
