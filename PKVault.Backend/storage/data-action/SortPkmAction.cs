using Microsoft.AspNetCore.Components.Forms;
using PKHeX.Core;

public record SortPkmActionInput(uint? saveId, int fromBoxId, int toBoxId, bool leaveEmptySlot);

public class SortPkmAction(
    ILoadersService loadersService,
    MainCreateBoxAction mainCreateBoxAction,
    IPkmVersionLoader pkmVersionLoader, IBoxLoader boxLoader
) : DataAction<SortPkmActionInput>
{
    protected override async Task<DataActionPayload> Execute(SortPkmActionInput input, DataUpdateFlags flags)
    {
        if (input.saveId == null)
        {
            return await ExecuteForMain(input.fromBoxId, input.toBoxId, input.leaveEmptySlot);
        }

        return await ExecuteForSave((uint)input.saveId, input.fromBoxId, input.toBoxId, input.leaveEmptySlot);
    }

    // TODO save + leaveEmptySlot
    private async Task<DataActionPayload> ExecuteForSave(uint saveId, int fromBoxId, int toBoxId, bool leaveEmptySlot)
    {
        var loaders = await loadersService.GetLoaders();
        var saveLoaders = loaders.saveLoadersDict[saveId];

        var boxes = (await GetBoxes(saveId, fromBoxId, toBoxId,
            GetBoxDto: async (id) => saveLoaders.Boxes.GetDto(id),
            GetBoxDtoAll: async () => saveLoaders.Boxes.GetAllDtos()
        ))
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
                },
                leaveEmptySlot
            );
        }

        return new(
            type: DataActionType.SORT_PKM,
            parameters: []
        );
    }

    private async Task<DataActionPayload> ExecuteForMain(int fromBoxId, int toBoxId, bool leaveEmptySlot)
    {
        var boxes = await GetBoxes(saveId: null, fromBoxId, toBoxId,
            GetBoxDto: boxLoader.GetDto,
            GetBoxDtoAll: boxLoader.GetAllDtos
        );
        var boxesIds = boxes.Select(box => box.IdInt).ToHashSet();

        var bankId = boxes[0].BankId;

        var pkms = boxesIds.SelectMany(boxId =>
            pkmVersionLoader.GetEntitiesByBox(boxId).Select(dict => dict.Value)
        ).SelectMany(dict => dict.Values).Where(pk => pk.IsMain);
        if (pkms.Any())
        {
            var filteredPkms = pkms
                .Select(mainVersion =>
                {
                    var mainVersionPkm = pkmVersionLoader.GetPkmVersionEntityPkm(mainVersion);
                    return (Version: mainVersion, Pkm: mainVersionPkm);
                });

            var pkmVersions = GetSortedPkms(
                pkms: [.. filteredPkms],
                GetSpecies: pkmVersion => pkmVersion.Pkm.Species,
                GetForm: pkmVersion => pkmVersion.Pkm.Form,
                GetGender: pkmVersion => pkmVersion.Pkm.Gender
            );
            var pkmSpecies = pkmVersions.Select(pkm => pkm.Pkm.Species).ToList();

            // required to avoid conflicts
            HashSet<string> placedVersions = [];

            RunSort(
                boxes,
                pkmSpecies,
                applyValue: (entry) =>
                {
                    var currentValue = pkmVersions[entry.Index].Version;
                    var currentPkm = pkmVersionLoader.GetPkmVersionEntityPkm(currentValue);

                    var entities = pkmVersionLoader.GetEntitiesByBox(currentValue.BoxId, currentValue.BoxSlot).Values
                        .Where(version => !placedVersions.Contains(version.Id));
                    entities.ToList().ForEach(entity =>
                    {
                        pkmVersionLoader.WriteEntity(entity with
                        {
                            BoxId = entry.BoxId,
                            BoxSlot = entry.BoxSlot
                        });

                        placedVersions.Add(entity.Id);
                    });
                },
                onSpaceMissing: () =>
                {
                    var box = mainCreateBoxAction.CreateBox(new(bankId, null));
                    boxes.Add(boxLoader.CreateDTO(box));
                },
                leaveEmptySlot
            );
        }

        return new DataActionPayload(
            type: DataActionType.SORT_PKM,
            parameters: []
        );
    }

    private async Task<List<BoxDTO>> GetBoxes(uint? saveId, int fromBoxId, int toBoxId, Func<string, Task<BoxDTO?>> GetBoxDto, Func<Task<List<BoxDTO>>> GetBoxDtoAll)
    {
        var fromBox = await GetBoxDto(fromBoxId.ToString());
        var bankId = fromBox.BankId;

        var boxes = (await GetBoxDtoAll())
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

    private void RunSort(List<BoxDTO> boxes, List<ushort> pkmSpecies, Action<(int Index, string BoxId, int BoxSlot)> applyValue, Action onSpaceMissing, bool leaveEmptySlot)
    {
        var lastSpecies = pkmSpecies.Last();
        // starts from 0 only to handle disabled pkms
        var minSpecies = pkmSpecies.First() == 0 ? 0 : 1;

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

        for (var species = minSpecies; species <= lastSpecies; species++)
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

                    applyValue((Index: currentIndex, BoxId: currentBox.Id, BoxSlot: currentSlot));

                    IncrementBoxSlot();
                }
            }
        }
    }
}
