using PKHeX.Core;

public record SortPkmActionInput(uint? saveId, int fromBoxId, int toBoxId, string pokedexName, bool leaveEmptySlot);

public class SortPkmAction(
    MainCreateBoxAction mainCreateBoxAction,
    StaticDataService staticDataService,
    IPkmVariantLoader pkmVariantLoader, IBoxLoader boxLoader, ISavesLoadersService savesLoadersService
) : DataAction<SortPkmActionInput>
{
    protected override async Task<DataActionPayload> Execute(SortPkmActionInput input, DataUpdateFlags flags)
    {
        if (input.saveId == null)
        {
            return await ExecuteForMain(input.fromBoxId, input.toBoxId, input.pokedexName, input.leaveEmptySlot);
        }

        return await ExecuteForSave((uint)input.saveId, input.fromBoxId, input.toBoxId, input.pokedexName, input.leaveEmptySlot);
    }

    private async Task<DataActionPayload> ExecuteForSave(uint saveId, int fromBoxId, int toBoxId, string pokedexName, bool leaveEmptySlot)
    {
        var saveLoaders = savesLoadersService.GetLoaders(saveId);
        ArgumentNullException.ThrowIfNull(saveLoaders);

        var boxes = (await GetBoxes(saveId, fromBoxId, toBoxId,
            GetBoxDto: async (id) => saveLoaders.Boxes.GetDto(id),
            GetBoxDtoByBank: async (bankId) => saveLoaders.Boxes.GetAllDtos()
        ))
            .FindAll(box => box.CanSaveReceivePkm);

        var boxesIds = boxes.Select(box => box.IdInt).ToHashSet();

        var pkms = saveLoaders.Pkms.GetAllDtos().FindAll(pkm => boxesIds.Contains(pkm.BoxId));
        if (pkms.Count > 0)
        {
            List<PkmSaveDTO> savePkms = await GetSortedPkms(
                pkms,
                GetSpecies: pkmVariant => pkmVariant.Species,
                GetForm: pkmVariant => pkmVariant.Form,
                GetGender: pkmVariant => pkmVariant.Gender,
                pokedexName
            );
            var pkmSpecies = savePkms.Select(pkm => pkm.Species).ToList();

            pkms.ForEach(pkm => saveLoaders.Pkms.DeleteDto(pkm.Id));

            await RunSort(
                boxes,
                pkmSpecies,
                applyValue: async (entry) =>
                {
                    var currentValue = savePkms[entry.Index];
                    saveLoaders.Pkms.WriteDto(saveLoaders.Pkms.CreateDTO(
                        currentValue.Save, currentValue.Pkm,
                        entry.BoxId, entry.BoxSlot
                    ));
                },
                onSpaceMissing: async () =>
                {
                    throw new ArgumentException($"Missing space, pkm sort cannot be done");
                },
                leaveEmptySlot,
                pokedexName
            );
        }

        return new(
            type: DataActionType.SORT_PKM,
            parameters: []
        );
    }

    private async Task<DataActionPayload> ExecuteForMain(int fromBoxId, int toBoxId, string pokedexName, bool leaveEmptySlot)
    {
        var boxes = await GetBoxes(saveId: null, fromBoxId, toBoxId,
            GetBoxDto: boxLoader.GetDto,
            GetBoxDtoByBank: async (bankId) =>
            {
                return [.. (await boxLoader.GetEntitiesByBank(bankId)).Values
                    .Select(box => boxLoader.CreateDTO(box))];
            }
        );
        var boxesIds = boxes.Select(box => box.IdInt).ToHashSet();

        var bankId = boxes[0].BankId;
        ArgumentNullException.ThrowIfNull(bankId);

        var pkms = (await Task.WhenAll(boxesIds.Select(async boxId =>
                (await pkmVariantLoader.GetEntitiesByBox(boxId)).Select(dict => dict.Value)
            )))
            .SelectMany(x => x)
            .SelectMany(dict => dict.Values).Where(pk => pk.IsMain);
        if (pkms.Any())
        {
            var filteredPkms = await Task.WhenAll(pkms
                .Select(async mainVariant =>
                {
                    var mainVersionPkm = await pkmVariantLoader.GetPKM(mainVariant);
                    return (Variant: mainVariant, Pkm: mainVersionPkm);
                }));

            var pkmVariants = await GetSortedPkms(
                pkms: [.. filteredPkms],
                GetSpecies: pkmVariant => pkmVariant.Pkm.Species,
                GetForm: pkmVariant => pkmVariant.Pkm.Form,
                GetGender: pkmVariant => pkmVariant.Pkm.Gender,
                pokedexName
            );
            var pkmSpecies = pkmVariants.Select(pkm => pkm.Pkm.Species).ToList();

            // required to avoid conflicts
            HashSet<string> placedVersions = [];

            await RunSort(
                boxes,
                pkmSpecies,
                applyValue: async (entry) =>
                {
                    var currentValue = pkmVariants[entry.Index].Variant;
                    var currentPkm = await pkmVariantLoader.GetPKM(currentValue);

                    var entities = (await pkmVariantLoader.GetEntitiesByBox(currentValue.BoxId, currentValue.BoxSlot)).Values
                        .Where(version => !placedVersions.Contains(version.Id));
                    foreach (var entity in entities)
                    {
                        entity.BoxId = entry.BoxId;
                        entity.BoxSlot = entry.BoxSlot;
                        await pkmVariantLoader.UpdateEntity(entity);

                        placedVersions.Add(entity.Id);
                    }
                },
                onSpaceMissing: async () =>
                {
                    var box = await mainCreateBoxAction.CreateBox(new(bankId, null));
                    boxes.Add(boxLoader.CreateDTO(box));
                },
                leaveEmptySlot,
                pokedexName
            );
        }

        return new DataActionPayload(
            type: DataActionType.SORT_PKM,
            parameters: []
        );
    }

    private async Task<List<BoxDTO>> GetBoxes(uint? saveId, int fromBoxId, int toBoxId, Func<string, Task<BoxDTO?>> GetBoxDto, Func<string, Task<List<BoxDTO>>> GetBoxDtoByBank)
    {
        var fromBox = await GetBoxDto(fromBoxId.ToString());
        ArgumentNullException.ThrowIfNull(fromBox);
        var bankId = fromBox.BankId;
        ArgumentNullException.ThrowIfNull(bankId);

        var boxes = (await GetBoxDtoByBank(bankId))
            .FindAll(box => saveId == null || box.CanSaveReceivePkm)
            .OrderBy(box => box.Order).ToList();

        var fromBoxIndex = boxes.FindIndex(box => box.IdInt == fromBoxId);
        var toBoxIndex = boxes.FindIndex(box => box.IdInt == toBoxId);

        return [.. boxes.Where((box, i) => i >= fromBoxIndex && i <= toBoxIndex)];
    }

    private async Task<List<P>> GetSortedPkms<P>(List<P> pkms, Func<P, ushort> GetSpecies, Func<P, byte> GetForm, Func<P, Gender> GetGender, string pokedexName)
    {
        var staticData = await staticDataService.GetStaticData();
        var staticPokedex = await GetPokedex(pokedexName);

        var maxIndex = staticPokedex.PokemonIndexes.Values.Max();

        return [.. pkms
            .OrderBy(pkm => {
                var species = GetSpecies(pkm);

                return staticData.Species.TryGetValue(species, out var staticSpecies)
                    ? (
                        staticSpecies.PokedexIndexes.TryGetValue(pokedexName, out var dexIndex)
                            ? dexIndex
                            : ++maxIndex
                    )
                    : ++maxIndex;
            })
            .ThenBy(GetForm)
            .ThenBy(GetGender)
        ];
    }

    private async Task<StaticPokedex> GetPokedex(string pokedexName)
    {
        var staticData = await staticDataService.GetStaticData();

        if (!staticData.Pokedexes.TryGetValue(pokedexName, out var staticPokedex))
        {
            throw new ArgumentException($"Pokedex name not found: {pokedexName}");
        }

        return staticPokedex;
    }

    private async Task RunSort(List<BoxDTO> boxes, List<ushort> pkmSpecies, Func<(int Index, string BoxId, int BoxSlot), Task> applyValue, Func<Task> onSpaceMissing, bool leaveEmptySlot, string pokedexName)
    {
        var staticPokedex = await GetPokedex(pokedexName);

        List<KeyValuePair<ushort, int>> indexes = [.. staticPokedex.PokemonIndexes.OrderBy(p => p.Value)];

        // species not in pokedex
        // including disabled pkms (species=0)
        var unhandledSpecies = pkmSpecies.Distinct().Where(species => !staticPokedex.PokemonIndexes.ContainsKey(species));

        var lastIndex = indexes.Last().Value;

        foreach (var species in unhandledSpecies)
        {
            indexes.Add(new(species, ++lastIndex));
        }

        var currentIndex = 0;
        var currentBoxIndex = 0;
        var currentSlot = 0;

        async Task<BoxDTO> GetCurrentBox()
        {
            if (currentBoxIndex > boxes.Count - 1)
            {
                await onSpaceMissing();
                return await GetCurrentBox();
            }

            return boxes[currentBoxIndex];
        }

        async Task IncrementBoxSlot()
        {
            var currentBox = await GetCurrentBox();

            if (currentSlot >= currentBox.SlotCount)
            {
                currentBoxIndex++;
                currentSlot = 0;
            }
            else
            {
                currentSlot++;
            }
        }

        foreach (var entry in indexes)
        {
            if (currentIndex >= pkmSpecies.Count) break;

            var species = entry.Key;

            var currentBox = await GetCurrentBox();

            var currentSpecies = pkmSpecies[currentIndex];

            // if (currentSpecies < species)
            // {
            //     throw new Exception($"Error with species {currentSpecies}");
            // }

            if (currentSpecies != species)
            {
                if (leaveEmptySlot)
                {
                    await IncrementBoxSlot();
                }
            }
            else
            {
                for (; ; currentIndex++)
                {
                    currentBox = await GetCurrentBox();

                    if (currentIndex >= pkmSpecies.Count) break;
                    currentSpecies = pkmSpecies[currentIndex];

                    if (currentSpecies != species)
                    {
                        break;
                    }

                    await applyValue((Index: currentIndex, BoxId: currentBox.Id, BoxSlot: currentSlot));

                    await IncrementBoxSlot();
                }
            }
        }
    }
}
