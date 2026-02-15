public record DataNormalizeActionInput();

public class DataNormalizeAction(
    SessionDbContext db,
    IBankLoader bankLoader, IBoxLoader boxLoader, IPkmVariantLoader pkmVariantLoader, IDexLoader dexLoader,
    ISessionService sessionService, IFileIOService fileIOService, ISettingsService settingsService,
    StaticDataService staticDataService, ISaveService saveService
) : DataAction<DataNormalizeActionInput>
{
    public static List<string> GetLegacyFilepaths(string dbPath) => [
        LegacyBankLoader.GetFilepath(dbPath),
        LegacyBoxLoader.GetFilepath(dbPath),
        LegacyPkmLoader.GetFilepath(dbPath),
        LegacyPkmVersionLoader.GetFilepath(dbPath),
        LegacyDexLoader.GetFilepath(dbPath)
    ];

    public async Task<bool> HasDataToNormalize()
    {
        if (!await bankLoader.Any())
        {
            Console.WriteLine("HasDataToNormalize - No bank");
            return true;
        }

        if (!await boxLoader.Any())
        {
            Console.WriteLine("HasDataToNormalize - No box");
            return true;
        }

        if (sessionService.HasMainDb())
        {
            return false;
        }

        var settings = settingsService.GetSettings();
        var dbPath = settings.GetDbPath();

        var hasLegacy = GetLegacyFilepaths(dbPath).Any(fileIOService.Exists);
        if (hasLegacy)
        {
            Console.WriteLine("HasDataToNormalize - Legacy");
            return true;
        }

        return false;
    }

    protected override async Task<DataActionPayload> Execute(DataNormalizeActionInput input, DataUpdateFlags flags)
    {
        await MigrateJSONLegacyData();
        await SetupInitialData();

        return new(
            DataActionType.DATA_NORMALIZE,
            []
        );
    }

    private async Task SetupInitialData()
    {
        if (!await bankLoader.Any())
        {
            await bankLoader.AddEntity(new()
            {
                Id = "0",
                IdInt = 0,
                Name = "Bank 1",
                IsDefault = true,
                Order = 0,
                View = new([], [])
            });
        }

        if (!await boxLoader.Any())
        {
            await boxLoader.AddEntity(new()
            {
                Id = "0",
                IdInt = 0,
                Name = "Box 1",
                Type = BoxType.Box,
                SlotCount = 30,
                Order = 0,
                BankId = "0"
            });
        }
    }

    private async Task<bool> MigrateJSONLegacyData()
    {
        var isAlreadyUsingSqlite = sessionService.HasMainDb();
        if (isAlreadyUsingSqlite)
        {
            Console.WriteLine("Already on sqlite, no json migration");
            return false;
        }

        var settings = settingsService.GetSettings();
        var dbPath = settings.GetDbPath();
        var storagePath = settings.GetStoragePath();
        var languageId = settings.GetSafeLanguageID();

        var hasLegacy = GetLegacyFilepaths(dbPath).Any(fileIOService.Exists);
        if (!hasLegacy)
        {
            return false;
        }

        var staticData = await staticDataService.GetStaticData();
        var evolves = staticData.Evolves;

        var legacyBankLoader = new LegacyBankLoader(fileIOService, dbPath);
        var legacyBoxLoader = new LegacyBoxLoader(fileIOService, dbPath);
        var legacyPkmLoader = new LegacyPkmLoader(fileIOService, dbPath);
        var legacyPkmVersionLoader = new LegacyPkmVersionLoader(
            fileIOService,
            dbPath,
            storagePath,
            evolves
        );
        var legacyDexLoader = new LegacyDexLoader(fileIOService, dbPath);

        using var _ = LogUtil.Time("Data normalize - json legacy migration");

        var saveById = await saveService.GetSaveCloneById();

        var legacyBankNormalize = new LegacyBankNormalize(legacyBankLoader);
        var legacyBoxNormalize = new LegacyBoxNormalize(legacyBoxLoader);
        var legacyPkmNormalize = new LegacyPkmNormalize(legacyPkmLoader, evolves);
        var legacyPkmVersionNormalize = new LegacyPkmVersionNormalize(legacyPkmVersionLoader, evolves);
        var legacyDexNormalize = new LegacyDexNormalize(legacyDexLoader);

        legacyPkmNormalize.CleanData(legacyPkmVersionLoader);
        legacyPkmVersionNormalize.CleanData();

        legacyBankNormalize.MigrateGlobalEntities();
        legacyBoxNormalize.MigrateGlobalEntities(legacyBankLoader);
        legacyPkmNormalize.MigrateGlobalEntities(legacyPkmVersionLoader, saveById);
        legacyPkmVersionNormalize.MigrateGlobalEntities();
        legacyDexNormalize.MigrateGlobalEntities();

        Console.WriteLine("Json migration inserts:");
        Console.WriteLine($"- {legacyBankLoader.GetAllEntities().Count} banks");
        Console.WriteLine($"- {legacyBoxLoader.GetAllEntities().Count} boxes");
        Console.WriteLine($"- {legacyPkmVersionLoader.GetAllEntities().Count} pkmVersions");
        Console.WriteLine($"- {legacyDexLoader.GetAllEntities().Count} dex");

        await using var transaction = await db.Database.BeginTransactionAsync();

        try
        {
            await bankLoader.AddEntities(
                legacyBankLoader.GetAllEntities().Values.Select(e => new BankEntity()
                {
                    Id = e.Id,
                    IdInt = e.IdInt,
                    Name = e.Name,
                    IsDefault = e.IsDefault,
                    Order = e.Order,
                    View = new(e.View.MainBoxIds, [..e.View.Saves.Select(s => new BankEntity.BankViewSave(
                        SaveId: s.SaveId,
                        SaveBoxIds: s.SaveBoxIds,
                        Order: s.Order
                    ))])
                })
            );

            await boxLoader.AddEntities(
                legacyBoxLoader.GetAllEntities().Values.Select(e => new BoxEntity()
                {
                    Id = e.Id,
                    IdInt = e.IdInt,
                    Name = e.Name,
                    Order = e.Order,
                    Type = e.Type,
                    SlotCount = e.SlotCount,
                    BankId = e.BankId
                })
            );

            await pkmVariantLoader.AddEntities(
                legacyPkmVersionLoader.GetAllEntities().Values.Select(e => new PkmVariantLoaderAddPayload(
                    BoxId: e.BoxId.ToString(),
                    BoxSlot: e.BoxSlot,
                    IsMain: e.IsMain,
                    AttachedSaveId: e.AttachedSaveId,
                    AttachedSavePkmIdBase: e.AttachedSavePkmIdBase,
                    Generation: e.Generation,
                    Pkm: legacyPkmVersionLoader.pkmFileLoader.CreatePKM(e.Id, e.Filepath, e.Generation),

                    // disabled pkms are allowed here to avoid data loss
                    Id: e.Id,
                    Filepath: e.Filepath,
                    Updated: false,
                    CheckPkm: false
                ))
            );

            await dexLoader.AddEntities(
                legacyDexLoader.GetAllEntities().Values
                    .SelectMany(e => e.Forms.Select(f => new DexFormEntity()
                    {
                        Id = DexLoader.GetId(e.Species, f.Form, f.Gender),
                        Species = e.Species,
                        Form = f.Form,
                        Gender = f.Gender,
                        Version = f.Version,
                        IsCaught = f.IsCaught,
                        IsCaughtShiny = f.IsCaughtShiny,
                        Languages = [languageId]    // pkm language is lost here, so we use app language as fallback
                    }))
            );

            await db.SaveChangesAsync();

            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }

        return true;
    }
}
