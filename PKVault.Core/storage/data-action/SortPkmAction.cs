using PKHeX.Core;

namespace PKVault.Core;

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
        var saveLoaders = savesLoadersService.GetLoadersRequired(saveId);

        var boxes = (await GetBoxes(saveId, fromBoxId, toBoxId,
            GetBoxDto: async (id) => saveLoaders.Boxes.GetDto(id),
            GetBoxDtoByBank: async (bankId) => saveLoaders.Boxes.GetAllDtos()
                .Where(dto => dto.Type != BoxType.Inventory)
                .ToList()
        ))
            .FindAll(box => box.CanSaveReceivePkm);
        var boxesDict = boxes.ToDictionary(p => p.Id);

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

                    boxesDict.TryGetValue(entry.BoxId, out var box);
                    saveLoaders.Pkms.WriteDto(saveLoaders.Pkms.CreateDTO(
                        currentValue.Save, currentValue.Pkm,
                        entry.BoxId, entry.BoxSlot
                    ), box);
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
                    .Where(box => box.Type != BoxType.Inventory)
                    .Select(box => boxLoader.CreateDTO(box))];
            }
        );
        var boxesDict = boxes.ToDictionary(p => p.Id);
        var boxesIds = boxes.Select(box => box.IdInt).ToHashSet();

        var bankId = boxes.First().BankId;
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

                    boxesDict.TryGetValue(entry.BoxId, out var box);

                    var entities = (await pkmVariantLoader.GetEntitiesByBox(currentValue.BoxId, currentValue.BoxSlot)).Values
                        .Where(version => !placedVersions.Contains(version.Id));
                    foreach (var entity in entities)
                    {
                        entity.BoxId = entry.BoxId;
                        entity.BoxSlot = entry.BoxSlot;
                        await pkmVariantLoader.UpdateEntity(entity, box);

                        placedVersions.Add(entity.Id);
                    }
                },
                onSpaceMissing: async () =>
                {
                    var box = await mainCreateBoxAction.CreateBox(new(bankId, null));
                    var dto = boxLoader.CreateDTO(box);
                    boxes.Add(dto);
                    boxesDict.Add(dto.Id, dto);
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
        if (fromBox.Type == BoxType.Inventory)
            throw new ArgumentException($"Cannot sort Pkm from Box Inventory");
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
        var staticPokedex = await GetPokedex(pokedexName);

        var maxIndex = staticPokedex.PokemonIndexes.Values.Max();
        // one rank per species not-in-pokedex
        var unknownRanks = new Dictionary<ushort, int>();

        return [.. pkms
            .OrderBy(pkm => {
                var species = GetSpecies(pkm);

                if (staticPokedex.PokemonIndexes.TryGetValue(species, out var dexIndex))
                    return dexIndex;

                if (!unknownRanks.TryGetValue(species, out var rank))
                {
                    rank = ++maxIndex;
                    unknownRanks[species] = rank;
                }
                return rank;
            })
            .ThenBy(GetForm)
            .ThenBy(GetGender)
        ];
    }

    private async Task<StaticPokedex> GetPokedex(string pokedexName)
    {
        var staticOthers = await staticDataService.GetStaticOthers();

        if (!staticOthers.Pokedexes.TryGetValue(pokedexName, out var staticPokedex))
        {
            throw new ArgumentException($"Pokedex name not found: {pokedexName}");
        }

        return staticPokedex;
    }

    private async Task RunSort(
        List<BoxDTO> boxes,
        // species of each storage pkms, sort defined by GetSortedPkms
        List<ushort> pkmSpecies,
        // set pkm from given Index to BoxSlot
        Func<(int Index, string BoxId, int BoxSlot), Task> applyValue,
        // create new box, or throw error in saves
        Func<Task> onSpaceMissing,
        bool leaveEmptySlot,
        // national, kanto, johto, etc
        string pokedexName
    )
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

        // pkm indexes grouped by species, original relative order preserved
        var pkmIndexesBySpecies = Enumerable.Range(0, pkmSpecies.Count).ToLookup(i => pkmSpecies[i]);

        var remaining = pkmSpecies.Count;
        var currentBoxIndex = 0;
        var currentSlot = 0;

        async Task<BoxDTO> GetCurrentBox()
        {
            while (currentBoxIndex > boxes.Count - 1)
            {
                await onSpaceMissing();
            }

            return boxes[currentBoxIndex];
        }

        async Task IncrementBoxSlot()
        {
            var currentBox = await GetCurrentBox();

            if (currentSlot >= currentBox.SlotCount - 1)
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
            // all pkms placed, no trailing empty slots
            if (remaining == 0)
                break;

            var pkmIndexes = pkmIndexesBySpecies[entry.Key];

            if (!pkmIndexes.Any())
            {
                // species of the pokedex missing in storage
                if (leaveEmptySlot)
                {
                    await IncrementBoxSlot();
                }
                continue;
            }

            foreach (var pkmIndex in pkmIndexes)
            {
                var currentBox = await GetCurrentBox();

                // set pkm from given Index to BoxSlot
                await applyValue((Index: pkmIndex, BoxId: currentBox.Id, BoxSlot: currentSlot));
                remaining--;

                await IncrementBoxSlot();
            }
        }
    }
}
