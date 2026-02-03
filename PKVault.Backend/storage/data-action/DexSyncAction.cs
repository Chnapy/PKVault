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

        var allValues = dex.Values
            .SelectMany(specEntry => specEntry.Values)
            .SelectMany(entry =>
            {
                var languagesHash = string.Join('.', entry.Languages.Select(id => (byte)id).ToArray().Order());
                return entry.Forms
                    .Select(form => (
                        form.Species,
                        form.Form,
                        form.Gender,
                        form.IsSeen,
                        form.IsSeenShiny,
                        form.IsCaught,
                        LanguagesHash: languagesHash
                    ));
            });

        var uniqueValues = allValues.ToHashSet();

        var filteredValues = uniqueValues
            .Where(form => form.IsSeen || form.IsCaught);

        var groupedValues = filteredValues
            .GroupBy(form => DexLoader.GetId(form.Species, form.Form, form.Gender));

        var ungroupedValues = groupedValues
            .Select(g =>
            {
                var baseForm = g.First();

                bool IsSeen = false, IsSeenShiny = false, IsCaught = false;
                HashSet<LanguageID> languages = [];
                foreach (var form in g)
                {
                    IsSeen |= form.IsSeen;
                    IsSeenShiny |= form.IsSeenShiny;
                    IsCaught |= form.IsCaught;
                    if (form.LanguagesHash.Length > 0)
                    {
                        IEnumerable<LanguageID> formLanguages = form.LanguagesHash.Split('.').Select(lang => (LanguageID)byte.Parse(lang));
                        foreach (var lang in formLanguages)
                        {
                            languages.Add(lang);
                        }
                    }
                }

                return (
                    baseForm.Species,
                    baseForm.Form,
                    baseForm.Gender,
                    IsSeen,
                    IsSeenShiny,
                    IsCaught,
                    Languages: languages.Order().ToArray()
                );
            });

        Console.WriteLine("\n\n");
        Console.WriteLine($"All values = {allValues.Count()}");
        Console.WriteLine($"Unique values = {uniqueValues.Count}");
        Console.WriteLine($"Filtered values = {filteredValues.Count()}");
        Console.WriteLine($"Grouped values = {groupedValues.Count()}");
        Console.WriteLine($"Ungrouped values = {ungroupedValues.Count()}");
        Console.WriteLine("\n\n");

        // TODO improve perfs, avoiding n complexity with thousand DB calls
        await Task.WhenAll(
            saveLoaders.Select(async saveLoader =>
            {
                var service = dexService.GetDexService(saveLoader?.Save ?? new(FakeSaveFile.Default));
                if (service == null)
                {
                    return;
                }

                foreach (var form in ungroupedValues)
                {
                    await service.EnableSpeciesForm(
                        form.Species,
                        form.Form,
                        form.Gender,
                        form.IsSeen,
                        form.IsSeenShiny,
                        form.IsCaught,
                        form.Languages
                    );
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
