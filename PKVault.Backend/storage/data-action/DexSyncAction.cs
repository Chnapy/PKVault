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

        var dex = await dexService.GetDex(input.saveIds, null);

        // TODO improve perfs, avoiding n3 complexity with thousand DB calls
        await Task.WhenAll(
            saveLoaders.Select(async saveLoader =>
            {
                var service = dexService.GetDexService(saveLoader?.Save ?? new(FakeSaveFile.Default));

                foreach (var specEntry in dex.Values)
                {
                    foreach (var entry in specEntry.Values)
                    {
                        foreach (var form in entry.Forms)
                        {
                            await service!.EnableSpeciesForm(
                                entry.Species,
                                form.Form,
                                form.Gender,
                                form.IsSeen,
                                form.IsSeenShiny,
                                form.IsCaught);
                        }
                    }
                }

                saveLoader?.Pkms.HasWritten = true;
            })
        );

        flags.Dex.All = true;

        return new(
            type: DataActionType.DEX_SYNC,
            parameters: []
        );
    }
}
