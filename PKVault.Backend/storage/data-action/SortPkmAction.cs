using PKHeX.Core;

public class SortPkmAction(uint? saveId, int fromBoxId, int toBoxId, bool leaveEmptySlot) : DataAction
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



        flags.Saves.Add(new()
        {
            SaveId = saveId,
            SavePkms = true
        });
        flags.Dex = true;

        return new()
        {
            type = DataActionType.SORT_PKM,
            parameters = []
        };
    }

    private async Task<DataActionPayload> ExecuteForMain(DataEntityLoaders loaders, DataUpdateFlags flags, int fromBoxId, int toBoxId, bool leaveEmptySlot)
    {
        var fromBox = loaders.boxLoader.GetDto(fromBoxId.ToString());
        var bankId = fromBox.BankId;

        var boxes = loaders.boxLoader.GetAllDtos()
            .FindAll(box => box.BankId == bankId)
            .OrderBy(box => box.Order).ToList();

        var fromBoxIndex = boxes.FindIndex(box => box.IdInt == fromBoxId);
        var toBoxIndex = boxes.FindIndex(box => box.IdInt == toBoxId);

        boxes = [.. boxes.Where((box, i) => i >= fromBoxIndex && i <= toBoxIndex)];
        var boxesIds = boxes.Select(box => box.IdInt).ToHashSet();

        var pkms = loaders.pkmLoader.GetAllDtos().FindAll(pkm => boxesIds.Contains((int)pkm.BoxId));
        List<(PkmDTO Pkm, PkmVersionDTO PkmVersion)> pkmsWithVersions = [.. pkms.Select(pkm =>
            {
                var pkmVersion = loaders.pkmVersionLoader.GetDtosByPkmId(pkm.Id).Values.ToList().Find(dto => dto.IsMain);
                return (Pkm: pkm, PkmVersion: pkmVersion!);
            })
            .OrderBy(pkmsWithVersion => pkmsWithVersion.PkmVersion.Species)
            .ThenBy(pkmsWithVersion => pkmsWithVersion.PkmVersion.Form)
            .ThenBy(pkmsWithVersion => (byte)pkmsWithVersion.PkmVersion.Gender)
        ];

        if (pkms.Count > 0)
        {

            var lastSpecies = pkmsWithVersions.Last().PkmVersion.Species;

            var currentIndex = 0;
            var currentBoxIndex = 0;
            var currentSlot = 0;

            BoxDTO GetCurrentBox()
            {
                if (currentBoxIndex >= boxes.Count - 1)
                {
                    var box = MainCreateBoxAction.CreateBox(loaders, flags, bankId, null);
                    boxes.Add(box);
                    return GetCurrentBox();
                }

                return boxes[currentBoxIndex];
            }

            void IncrementBoxSlot()
            {
                var currentBox = GetCurrentBox();

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

            for (var species = 1; species <= lastSpecies; species++)
            {
                var currentBox = GetCurrentBox();

                if (currentIndex >= pkmsWithVersions.Count) break;
                var currentValue = pkmsWithVersions[currentIndex];

                if (currentValue.PkmVersion.Species < species)
                {
                    throw new Exception($"Error with species {currentValue.PkmVersion.Species}");
                }

                if (currentValue.PkmVersion.Species != species)
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

                        if (currentIndex >= pkmsWithVersions.Count) break;
                        currentValue = pkmsWithVersions[currentIndex];

                        if (currentValue.PkmVersion.Species != species)
                        {
                            break;
                        }

                        currentValue.Pkm.PkmEntity.BoxId = (uint)currentBox.IdInt;
                        currentValue.Pkm.PkmEntity.BoxSlot = (uint)currentSlot;
                        loaders.pkmLoader.WriteDto(currentValue.Pkm);

                        IncrementBoxSlot();
                    }
                }
            }

            // new Set(temp2.map(p => p.boxId + '.' + p.boxSlot)).size === temp2.length

            flags.MainBoxes = true;
            flags.MainPkms = true;
            flags.MainPkmVersions = true;
        }

        return new DataActionPayload
        {
            type = DataActionType.SORT_PKM,
            parameters = []
        };
    }
}
