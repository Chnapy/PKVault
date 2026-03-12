using PKHeX.Core;

public record UpdateExtraPkmActionInput(
    UpdateExtraPkmData[] ExtraPkmsToAdd
);

public record UpdateExtraPkmData(PkmFileEntity PkmFileEntity, ImmutablePKM Pkm);

public class UpdateExtraPkmAction(
    StaticDataService staticDataService,
    IPkmVariantLoader pkmVariantLoader, IPkmFileLoader pkmFileLoader, IBankLoader bankLoader, IBoxLoader boxLoader,
    IFileIOService fileIOService, ISettingsService settingsService
) : DataAction<UpdateExtraPkmActionInput>
{
    public async Task<UpdateExtraPkmActionInput> HasExtraPkmsToUpdate()
    {
        var emptyInput = new UpdateExtraPkmActionInput(ExtraPkmsToAdd: []);

        var pkmExtraGlobs = (settingsService.GetSettings().SettingsMutable.PKM_EXTERNAL_GLOBS ?? [])
            .Select(glob => glob.Trim())
            .Where(glob => glob.Length > 0)
            .ToArray();
        if (pkmExtraGlobs.Length == 0)
        {
            return emptyInput;
        }

        var searchPaths = MatcherUtil.SearchPaths(pkmExtraGlobs);
        if (searchPaths.Count == 0)
        {
            return emptyInput;
        }

        var entities = await pkmVariantLoader.GetAllEntities();

        var ids = entities.Values.Select(e => e.Id).ToHashSet();
        var filepaths = entities.Values.Select(e => e.Filepath).ToHashSet();

        var searchPathsNotIncluded = searchPaths
            .Where(path => !filepaths.Contains(path));
        if (!searchPathsNotIncluded.Any())
        {
            return emptyInput;
        }

        var evolves = (await staticDataService.GetStaticData()).Evolves;

        var extraPkmsToAdd = (await Task.WhenAll(
            searchPathsNotIncluded.Select(async (filepath) =>
            {
                var pkmFile = new PkmFileEntity()
                {
                    Filepath = filepath,
                    Data = [],
                    Error = null,
                    Updated = false,
                    Deleted = false,
                };

                try
                {
                    var (TooSmall, TooBig) = fileIOService.CheckGameFile(filepath);

                    if (TooBig)
                        throw new PKMLoadException(PKMLoadError.TOO_BIG);

                    if (TooSmall)
                        throw new PKMLoadException(PKMLoadError.TOO_SMALL);

                    var data = await fileIOService.ReadBytes(filepath);

                    pkmFile.Data = await fileIOService.ReadBytes(filepath);
                    pkmFile.Error = null;
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine(ex);
                    return null;
                }

                pkmFile.Updated = false;
                pkmFile.Deleted = false;

                var pkm = await pkmFileLoader.CreatePKM(pkmFile, generation: 0);
                if (!pkm.IsEnabled)
                {
                    return null;
                }

                var id = pkm.GetPKMIdBase(evolves);
                if (ids.Contains(id))
                {
                    return null;
                }

                return new UpdateExtraPkmData(
                    PkmFileEntity: pkmFile,
                    Pkm: pkm
                );
            })
        ))
        .OfType<UpdateExtraPkmData>()
        .ToArray();

        return new(
            ExtraPkmsToAdd: extraPkmsToAdd
        );
    }

    protected override async Task<DataActionPayload> Execute(UpdateExtraPkmActionInput input, DataUpdateFlags flags)
    {
        var pkmsToAdd = input.ExtraPkmsToAdd;

        Console.WriteLine($"Update ExtraPkms ({pkmsToAdd.Length})");

        foreach (var pkm in pkmsToAdd)
            Console.WriteLine(pkm.PkmFileEntity.Filepath);

        var banksAndBoxes = pkmsToAdd.Select(pkm =>
        {
            var filepath = MatcherUtil.NormalizePath(pkm.PkmFileEntity.Filepath);
            var fileparts = filepath.Split('/').Reverse().ToArray();

            var filename = fileparts.ElementAt(0);

            var boxname = fileparts.ElementAtOrDefault(1);
            if (string.IsNullOrWhiteSpace(boxname) || boxname == ".") boxname = "Default";

            var bankname = fileparts.ElementAtOrDefault(2);
            if (string.IsNullOrWhiteSpace(bankname) || bankname == ".") bankname = "Extra";

            return (
                pkm.PkmFileEntity,
                pkm.Pkm,
                Filename: filename,
                Boxname: boxname,
                Bankname: bankname,
                Storagekey: $"{bankname}_{boxname}"
            );
        });

        var banksNames = banksAndBoxes.Select(item => item.Bankname).Distinct();

        Dictionary<string, HashSet<string>> banksDict = [];

        foreach (var bankAndBoxes in banksAndBoxes)
        {
            if (!banksDict.TryGetValue(bankAndBoxes.Bankname, out var boxes))
            {
                boxes = [];
                banksDict.Add(bankAndBoxes.Bankname, boxes);
            }
            boxes.Add(bankAndBoxes.Boxname);
        }

        var banks = (await bankLoader.GetAllEntities()).Values.ToList();

        var bankMaxId = banks.Max(b => b.IdInt);
        var bankMaxOrder = banks.Max(b => b.Order);

        var boxMaxId = await boxLoader.GetMaxId();

        var existingPkms = pkmVariantLoader.GetAllEntities();

        foreach (var bankData in banksDict)
        {
            Console.WriteLine($"{bankData.Key} -> {string.Join(',', bankData.Value)}");

            var bank = banks.Find(b => b.IsExternal && b.Name == bankData.Key);
            if (bank == null)
            {
                bankMaxId++;
                bankMaxOrder++;

                bank = await bankLoader.AddEntity(new()
                {
                    Id = bankMaxId.ToString(),
                    IdInt = bankMaxId,
                    Name = bankData.Key,
                    IsDefault = false,
                    IsExternal = true,
                    Order = bankMaxOrder,
                    View = new([], [])
                });
            }

            var boxes = await boxLoader.GetEntitiesByBank(bank.Id);

            var boxMaxOrder = boxes.Count > 0
                ? boxes.Values.Max(b => b.Order)
                : 0;

            foreach (var boxname in bankData.Value)
            {
                var boxPkmsToAdd = banksAndBoxes
                    .Where(bab => bab.Storagekey == $"{bank.Name}_{boxname}")
                    .ToList();

                var box = boxes.Values.ToList().Find(b => b.Name == boxname);
                if (box == null)
                {
                    boxMaxId++;
                    boxMaxOrder++;

                    box = await boxLoader.AddEntity(new()
                    {
                        Id = boxMaxId.ToString(),
                        IdInt = boxMaxId,
                        Name = boxname,
                        Order = boxMaxOrder,
                        Type = BoxType.Box,
                        SlotCount = boxPkmsToAdd.Count,
                        BankId = bank.Id
                    });
                }

                var existingBoxPkms = await pkmVariantLoader.GetEntitiesByBox(box.IdInt);

                var boxSlot = existingBoxPkms.Count > 0
                    ? existingBoxPkms.Values.Max(pkm => pkm.Values.First().BoxSlot) + 1
                    : 0;

                var slotCount = boxPkmsToAdd.Count + boxSlot;
                if (slotCount > box.SlotCount)
                {
                    box.SlotCount = slotCount;
                    await boxLoader.UpdateEntity(box);
                }

                await pkmVariantLoader.AddEntities(boxPkmsToAdd.Select(pkm =>
                {
                    var payload = new PkmVariantLoaderAddPayload(
                        BoxId: box.Id,
                        BoxSlot: boxSlot,
                        IsMain: true,
                        IsExternal: true,
                        AttachedSaveId: null,
                        AttachedSavePkmIdBase: null,
                        Generation: pkm.Pkm.Generation,
                        Pkm: pkm.Pkm,
                        Filepath: pkm.PkmFileEntity.Filepath,
                        Updated: false
                    );

                    boxSlot++;

                    return payload;
                }));
            }
        }

        return new(
            DataActionType.UPDATE_EXTERNAL_PKM,
            [input.ExtraPkmsToAdd.Length]
        );
    }
}
