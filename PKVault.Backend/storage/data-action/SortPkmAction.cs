using PKHeX.Core;

public class SortPkmAction(
    uint? saveId, int fromBoxId, int toBoxId, bool leaveEmptySlot
) : DataAction
{
    protected override async Task<DataActionPayload> Execute(DataEntityLoaders loaders, DataUpdateFlags flags)
    {
        if (saveId == null)
        {
            return await ExecuteForMain(loaders, flags, fromBoxId, toBoxId, leaveEmptySlot);
        }

        return await ExecuteForSave(loaders, flags, (uint)saveId, fromBoxId, toBoxId, leaveEmptySlot);
    }

    private async Task<DataActionPayload> ExecuteForSave(DataEntityLoaders loaders, DataUpdateFlags flags, uint saveId, int fromBoxId, int toBoxId, bool leaveEmptySlot)
    {
        var saveLoaders = loaders.saveLoadersDict[saveId];

        var boxes = GetBoxes(fromBoxId, toBoxId,
            GetBoxDto: saveLoaders.Boxes.GetDto,
            GetBoxDtoAll: saveLoaders.Boxes.GetAllDtos
        )
            .FindAll(box => box.CanSaveReceivePkm);

        var boxesIds = boxes.Select(box => box.IdInt).ToHashSet();

        var pkms = saveLoaders.Pkms.GetAllDtos().FindAll(pkm => boxesIds.Contains(pkm.BoxId));
        if (pkms.Count > 0)
        {
            List<PkmSaveDTO> savePkms = GetSortedPkms(
                pkms,
                GetSpecies: pkmVersion => pkmVersion.Species,
                GetForm: pkmVersion => pkmVersion.Form,
                GetGender: pkmVersion => pkmVersion.Gender
            );
            var pkmSpecies = savePkms.Select(pkm => pkm.Species).ToList();

            pkms.ForEach(pkm => saveLoaders.Pkms.DeleteDto(pkm.Id));

            RunSort(
                boxes,
                pkmSpecies,
                applyValue: (entry) =>
                {
                    var currentValue = savePkms[entry.Index];
                    saveLoaders.Pkms.WriteDto(saveLoaders.Pkms.CreateDTO(
                        currentValue.Save, currentValue.Pkm,
                        entry.BoxId, entry.BoxSlot
                    ));
                },
                onSpaceMissing: () =>
                {
                    throw new ArgumentException($"Missing space, pkm sort cannot be done");
                }
            );
        }

        return new(
            type: DataActionType.SORT_PKM,
            parameters: []
        );
    }

    private async Task<DataActionPayload> ExecuteForMain(DataEntityLoaders loaders, DataUpdateFlags flags, int fromBoxId, int toBoxId, bool leaveEmptySlot)
    {
        var boxes = GetBoxes(fromBoxId, toBoxId,
            GetBoxDto: loaders.boxLoader.GetDto,
            GetBoxDtoAll: loaders.boxLoader.GetAllDtos
        );
        var boxesIds = boxes.Select(box => box.IdInt).ToHashSet();

        var bankId = boxes[0].BankId;

        var pkms = boxesIds.SelectMany(boxId =>
            loaders.pkmVersionLoader.GetEntitiesByBox(boxId).Select(dict => dict.Value)
        ).SelectMany(dict => dict.Values);
        if (pkms.Any())
        {
            var filteredPkms = pkms
                .Select(pkm =>
                {
                    var mainVersion = loaders.pkmVersionLoader.GetEntitiesByBox(pkm.BoxId, pkm.BoxSlot).Values.ToList()
                        .Find(pkm => pkm.IsMain)!;
                    var mainVersionPkm = loaders.pkmVersionLoader.GetPkmVersionEntityPkm(mainVersion);
                    return (Version: mainVersion, Pkm: mainVersionPkm);
                });

            var pkmVersions = GetSortedPkms(
                pkms: [.. filteredPkms],
                GetSpecies: pkmVersion => pkmVersion.Pkm.Species,
                GetForm: pkmVersion => pkmVersion.Pkm.Form,
                GetGender: pkmVersion => pkmVersion.Pkm.Gender
            );
            var pkmSpecies = pkmVersions.Select(pkm => pkm.Pkm.Species).ToList();

            RunSort(
                boxes,
                pkmSpecies,
                applyValue: (entry) =>
                {
                    var currentValue = pkmVersions[entry.Index].Version;
                    var entities = loaders.pkmVersionLoader.GetEntitiesByBox(currentValue.BoxId, currentValue.BoxSlot);
                    entities.Values.ToList().ForEach(entity =>
                    {
                        loaders.pkmVersionLoader.WriteEntity(entity with
                        {
                            BoxId = entry.BoxId,
                            BoxSlot = entry.BoxSlot
                        });
                    });
                },
                onSpaceMissing: () =>
                {
                    var box = MainCreateBoxAction.CreateBox(loaders, flags, bankId, null);
                    boxes.Add(loaders.boxLoader.CreateDTO(box));
                }
            );
        }

        return new DataActionPayload(
            type: DataActionType.SORT_PKM,
            parameters: []
        );
    }

    private List<BoxDTO> GetBoxes(int fromBoxId, int toBoxId, Func<string, BoxDTO?> GetBoxDto, Func<List<BoxDTO>> GetBoxDtoAll)
    {
        var fromBox = GetBoxDto(fromBoxId.ToString());
        var bankId = fromBox.BankId;

        var boxes = GetBoxDtoAll()
            .FindAll(box => box.BankId == bankId)
            .FindAll(box => saveId == null || box.CanSaveReceivePkm)
            .OrderBy(box => box.Order).ToList();

        var fromBoxIndex = boxes.FindIndex(box => box.IdInt == fromBoxId);
        var toBoxIndex = boxes.FindIndex(box => box.IdInt == toBoxId);

        return [.. boxes.Where((box, i) => i >= fromBoxIndex && i <= toBoxIndex)];
    }

    private static List<P> GetSortedPkms<P>(List<P> pkms, Func<P, ushort> GetSpecies, Func<P, byte> GetForm, Func<P, Gender> GetGender)
    {
        return [.. pkms
            .OrderBy(GetSpecies)
            .ThenBy(GetForm)
            .ThenBy(GetGender)
        ];
    }

    private void RunSort(List<BoxDTO> boxes, List<ushort> pkmSpecies, Action<(int Index, int BoxId, int BoxSlot)> applyValue, Action onSpaceMissing)
    {
        var lastSpecies = pkmSpecies.Last();

        var currentIndex = 0;
        var currentBoxIndex = 0;
        var currentSlot = 0;

        BoxDTO GetCurrentBox()
        {
            if (currentBoxIndex > boxes.Count - 1)
            {
                onSpaceMissing();
                return GetCurrentBox();
            }

            return boxes[currentBoxIndex];
        }

        void IncrementBoxSlot()
        {
            var currentBox = GetCurrentBox();

            if (currentSlot > currentBox.SlotCount - 1)
            {
                currentBoxIndex++;
                currentSlot = 0;
            }
            else
            {
                currentSlot++;
            }
        }

        // starts from 0 to handle disabled pkms
        for (var species = 0; species <= lastSpecies; species++)
        {
            var currentBox = GetCurrentBox();

            if (currentIndex >= pkmSpecies.Count) break;
            var currentSpecies = pkmSpecies[currentIndex];

            if (currentSpecies < species)
            {
                throw new Exception($"Error with species {currentSpecies}");
            }

            if (currentSpecies != species)
            {
                if (leaveEmptySlot)
                {
                    IncrementBoxSlot();
                }
            }
            else
            {
                for (; ; currentIndex++)
                {
                    currentBox = GetCurrentBox();

                    if (currentIndex >= pkmSpecies.Count) break;
                    currentSpecies = pkmSpecies[currentIndex];

                    if (currentSpecies != species)
                    {
                        break;
                    }

                    applyValue((Index: currentIndex, BoxId: currentBox.IdInt, BoxSlot: currentSlot));

                    IncrementBoxSlot();
                }
            }
        }
    }
}
