using PKHeX.Core;

public record UpdateExternalPkmActionInput(
    UpdateExternalPkmData[] ExternalPkmsToAdd,
    PkmVariantEntity[] ExternalPkmsToRemove
)
{
    public bool ShouldRun => ExternalPkmsToAdd.Length > 0 || ExternalPkmsToRemove.Length > 0;
}

public record UpdateExternalPkmData(PkmFileEntity PkmFileEntity, ImmutablePKM Pkm);

public class UpdateExternalPkmAction(
    StaticDataService staticDataService,
    IPkmVariantLoader pkmVariantLoader, IPkmFileLoader pkmFileLoader, IBankLoader bankLoader, IBoxLoader boxLoader,
    IFileIOService fileIOService, ISettingsService settingsService
) : DataAction<UpdateExternalPkmActionInput>
{
    public async Task<UpdateExternalPkmActionInput> HasExternalPkmsToUpdate()
    {
        using var _ = LogUtil.Time($"UpdateExternalPkmAction.HasExternalPkmsToUpdate");

        var pkmExternalGlobs = (settingsService.GetSettings().SettingsMutable.PKM_EXTERNAL_GLOBS ?? [])
            .Select(glob => glob.Trim())
            .Where(glob => glob.Length > 0)
            .ToArray();
        var searchPaths = MatcherUtil.SearchPaths(pkmExternalGlobs).ToHashSet();

        var externalPkmsToRemove = await pkmVariantLoader.GetExternalEntitiesDisabledOrNotInPaths(searchPaths);

        var (Ids, Filepaths) = await pkmVariantLoader.GetIdsAndFilepathsWithoutExternalDisabled();

        foreach (var pkmToRemove in externalPkmsToRemove.Values)
        {
            Ids.Remove(pkmToRemove.Id);
            Filepaths.Remove(pkmToRemove.Filepath);
        }

        Lock hashSetLock = new();

        bool AddIdConcurrent(string id)
        {
            lock (hashSetLock)
            {
                return Ids.Add(id);
            }
        }

        var searchPathsNotIncluded = searchPaths
            .Where(path => !Filepaths.Contains(path));

        var evolves = (await staticDataService.GetStaticData()).Evolves;

        // avoid CPU spikes
        using var semaphore = new SemaphoreSlim(16);

        var externalPkmsToAdd = (await Task.WhenAll(
            searchPathsNotIncluded.Select(async (filepath) =>
            {
                await semaphore.WaitAsync();
                try
                {
                    return await PkmFileLoader.LoadPkmFile(fileIOService, new()
                    {
                        Filepath = filepath,
                        Data = [],
                        Error = null,
                        Updated = false,
                        Deleted = false,
                    });
                }
                finally
                {
                    semaphore.Release();
                }
            })
        ))
        .Select(pkmFile =>
        {
            var pkm = pkmFileLoader.CreatePKM(pkmFile, EntityContext.None);
            if (!pkm.IsEnabled)
            {
                return null;
            }

            var id = pkm.GetPKMIdBase(evolves);
            if (Ids.Contains(id))
            {
                return null;
            }
            AddIdConcurrent(id);

            return new UpdateExternalPkmData(
                PkmFileEntity: pkmFile,
                Pkm: pkm
            );
        })
        .OfType<UpdateExternalPkmData>()
        .ToArray();

        return new(
            ExternalPkmsToAdd: externalPkmsToAdd,
            ExternalPkmsToRemove: [.. externalPkmsToRemove.Values]
        );
    }

    protected override async Task<DataActionPayload> Execute(UpdateExternalPkmActionInput input, DataUpdateFlags flags)
    {
        using var _ = LogUtil.Time($"UpdateExternalPkmAction.Execute Adds={input.ExternalPkmsToAdd.Length} Deletes={input.ExternalPkmsToRemove.Length}");

        await RemoveDisabledPkms(input.ExternalPkmsToRemove, flags);

        await AddExternalPkms(input.ExternalPkmsToAdd, flags);

        return new(
            DataActionType.UPDATE_EXTERNAL_PKM,
            [input.ExternalPkmsToAdd.Length, input.ExternalPkmsToRemove.Length]
        );
    }

    private async Task AddExternalPkms(UpdateExternalPkmData[] externalPkmsToAdd, DataUpdateFlags flags)
    {
        // Console.WriteLine($"Update external pkms ({externalPkmsToAdd.Length})");

        // foreach (var pkm in externalPkmsToAdd)
        //     Console.WriteLine(pkm.PkmFileEntity.Filepath);

        List<PkmVariantLoaderAddPayload> pkmVariantsToAdd = [];

        var pkmsBanksBoxes = externalPkmsToAdd.Select(pkm =>
        {
            var filepath = MatcherUtil.NormalizePath(pkm.PkmFileEntity.Filepath);
            var fileparts = filepath.Split('/').Reverse().ToArray();

            var filename = fileparts.ElementAt(0);

            var boxName = fileparts.ElementAtOrDefault(1);
            if (string.IsNullOrWhiteSpace(boxName) || boxName == ".") boxName = "Default";

            var bankName = fileparts.ElementAtOrDefault(2);
            if (string.IsNullOrWhiteSpace(bankName) || bankName == ".") bankName = "External";

            return (
                pkm.PkmFileEntity,
                pkm.Pkm,
                BoxName: boxName,
                BankName: bankName
            );
        });

        var existingBanks = (await bankLoader.GetAllEntities()).Values.ToList();

        var bankMaxId = existingBanks.Max(b => b.IdInt);
        var bankMaxOrder = existingBanks.Max(b => b.Order);

        var boxMaxId = await boxLoader.GetMaxId();

        var bankNames = pkmsBanksBoxes.Select(pbb => pbb.BankName).Distinct();

        foreach (var bankName in bankNames)
        {
            var pkmsBoxes = pkmsBanksBoxes.Where(pbb => pbb.BankName == bankName);
            var boxesNames = pkmsBoxes.Select(pb => pb.BoxName).Distinct();

            // Console.WriteLine($"{bankName} -> {string.Join(',', boxesNames)}");

            var bank = existingBanks.Find(b => b.IsExternal && b.Name == bankName);
            if (bank == null)
            {
                bankMaxId++;
                bankMaxOrder++;

                bank = await bankLoader.AddEntity(new()
                {
                    Id = bankMaxId.ToString(),
                    IdInt = bankMaxId,
                    Name = bankName,
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

            foreach (var boxName in boxesNames)
            {
                var boxPkmsToAdd = pkmsBoxes
                    .Where(pb => pb.BoxName == boxName)
                    .ToList();

                var box = boxes.Values.ToList().Find(b => b.Name == boxName);
                if (box == null)
                {
                    boxMaxId++;
                    boxMaxOrder++;

                    box = await boxLoader.AddEntity(new()
                    {
                        Id = boxMaxId.ToString(),
                        IdInt = boxMaxId,
                        Name = boxName,
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

                foreach (var boxPkm in boxPkmsToAdd)
                {
                    pkmVariantsToAdd.Add(new(
                        BoxId: box.Id,
                        BoxSlot: boxSlot,
                        IsMain: true,
                        IsExternal: true,
                        AttachedSaveId: null,
                        AttachedSavePkmIdBase: null,
                        Context: boxPkm.Pkm.Context,
                        Generation: boxPkm.Pkm.Generation,
                        Pkm: boxPkm.Pkm,
                        Filepath: boxPkm.PkmFileEntity.Filepath,
                        Updated: false
                    ));

                    boxSlot++;
                }

                // chunk to avoid CPU/memory spike
                if (pkmVariantsToAdd.Count > 500)
                {
                    await pkmVariantLoader.AddEntities(pkmVariantsToAdd);
                    pkmVariantsToAdd.Clear();
                }
            }
        }

        if (pkmVariantsToAdd.Count > 0)
        {
            await pkmVariantLoader.AddEntities(pkmVariantsToAdd);
        }
    }

    private async Task RemoveDisabledPkms(PkmVariantEntity[] externalPkmsToRemove, DataUpdateFlags flags)
    {
        // Console.WriteLine($"Remove external pkms ({externalPkmsToRemove.Length})");

        if (externalPkmsToRemove.Length == 0)
        {
            return;
        }

        // careful here to not delete PK files !
        foreach (var pkmVariant in externalPkmsToRemove)
        {
            await pkmVariantLoader.DeleteEntityDBOnly(pkmVariant);
        }

        var pkmsBoxes = (await boxLoader.GetEntitiesByIds(
            [.. externalPkmsToRemove.Select(pkm => pkm.BoxId).Distinct()]
        )).Values;

        var externalBanksToCheck = (IEnumerable<BankEntity>)(await bankLoader.GetEntitiesByIds(
            [.. pkmsBoxes.Select(box => box!.BankId).Distinct()]
        )).Values
        .Where(bank => bank!.IsExternal);

        var externalBankIds = externalBanksToCheck
        .Select(bank => bank.Id)
        .ToHashSet();

        var externalBoxesToCheck = pkmsBoxes
        .Where(box => externalBankIds.Contains(box.BankId));

        foreach (var box in externalBoxesToCheck)
        {
            var entities = await pkmVariantLoader.GetEntitiesByBox(box.Id);
            if (entities.Count == 0)
            {
                await boxLoader.DeleteEntity(box);
            }
            else if (entities.Count != box.SlotCount)
            {
                box.SlotCount = entities.Count;
                await boxLoader.UpdateEntity(box);
            }
        }

        foreach (var bank in externalBanksToCheck)
        {
            var boxes = await boxLoader.GetEntitiesByBank(bank.Id);
            if (boxes.Count == 0)
            {
                await bankLoader.DeleteEntity(bank);
            }
        }
    }
}
