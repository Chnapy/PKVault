using Microsoft.EntityFrameworkCore;

public class DbSeedingService(
    SessionService sessionService, IFileIOService fileIOService, ISettingsService settingsService,
    StaticDataService staticDataService, ISaveService saveService
)
{
    public async Task Seed(DbContext db, bool _, CancellationToken cancelToken)
    {
        var time = LogUtil.Time("DB seeding");
        await SeedJSONLegacyData(db, cancelToken);
        await SeedInitialData(db, cancelToken);
        await SeedPkmFilesData(db, cancelToken);
        time();
    }

    private async Task SeedInitialData(DbContext db, CancellationToken cancelToken)
    {
        var banks = db.Set<BankEntity>();
        var boxes = db.Set<BoxEntity>();

        if (!banks.Any())
        {
            await banks.AddAsync(new(
                Id: "0",
                Name: "Bank 1",
                IsDefault: true,
                Order: 0,
                View: new([], [])
            ), cancelToken);

            await db.SaveChangesAsync(cancelToken);
        }

        if (!boxes.Any())
        {
            await boxes.AddAsync(new(
                Id: "0",
                Name: "Box 1",
                Type: BoxType.Box,
                SlotCount: 30,
                Order: 0,
                BankId: "0"
            ), cancelToken);

            await db.SaveChangesAsync(cancelToken);
        }
    }

    private async Task<bool> SeedJSONLegacyData(DbContext db, CancellationToken cancelToken)
    {
        var isAlreadyUsingSqlite = sessionService.HasMainDb();
        if (isAlreadyUsingSqlite)
        {
            Console.WriteLine("Already on sqlite, no json migration");
            return false;
        }

        Console.WriteLine("Json migration starting");

        var staticData = await staticDataService.GetStaticData();
        var evolves = staticData.Evolves;

        var settings = settingsService.GetSettings();
        var dbPath = settings.SettingsMutable.DB_PATH;
        var storagePath = settings.SettingsMutable.STORAGE_PATH;

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

        string[] filepaths = [legacyBankLoader.FilePath, legacyBoxLoader.FilePath, legacyPkmVersionLoader.FilePath, legacyDexLoader.FilePath];
        var hasLegacy = filepaths.Any(fileIOService.Exists);
        if (!hasLegacy)
        {
            return false;
        }

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

        var banks = db.Set<BankEntity>();
        var boxes = db.Set<BoxEntity>();
        var pkmVersions = db.Set<PkmVersionEntity>();
        var dex = db.Set<DexEntity>();

        await banks.AddRangeAsync(
            legacyBankLoader.GetAllEntities().Values.Select(e => new BankEntity(
                Id: e.Id,
                Name: e.Name,
                IsDefault: e.IsDefault,
                Order: e.Order,
                View: new(e.View.MainBoxIds, [..e.View.Saves.Select(s => new BankEntity.BankViewSave(
                    SaveId: s.SaveId,
                    SaveBoxIds: s.SaveBoxIds,
                    Order: s.Order
                ))])
            )),
        cancelToken);

        await boxes.AddRangeAsync(
            legacyBoxLoader.GetAllEntities().Values.Select(e => new BoxEntity(
                Id: e.Id,
                Name: e.Name,
                Order: e.Order,
                Type: e.Type,
                SlotCount: e.SlotCount,
                BankId: e.BankId
            )),
        cancelToken);

        await pkmVersions.AddRangeAsync(
            legacyPkmVersionLoader.GetAllEntities().Values.Select(e => new PkmVersionEntity(
                Id: e.Id,
                BoxId: e.BoxId.ToString(),
                BoxSlot: e.BoxSlot,
                IsMain: e.IsMain,
                AttachedSaveId: e.AttachedSaveId,
                AttachedSavePkmIdBase: e.AttachedSavePkmIdBase,
                Generation: e.Generation,
                Filepath: e.Filepath
            )),
        cancelToken);

        await dex.AddRangeAsync(
            legacyDexLoader.GetAllEntities().Values.Select(e => new DexEntity(
                Id: e.Id,
                Species: e.Species,
                Forms: [..e.Forms.Select(f => new DexEntityForm(
                    Form: f.Form,
                    Version: f.Version,
                    Gender: f.Gender,
                    IsCaught: f.IsCaught,
                    IsCaughtShiny: f.IsCaughtShiny
                ))]
            )),
        cancelToken);

        await db.SaveChangesAsync(cancelToken);

        return true;
    }

    private async Task SeedPkmFilesData(DbContext db, CancellationToken cancelToken)
    {
        var pkmFiles = db.Set<PkmFileEntity>();
        var pkmVersions = db.Set<PkmVersionEntity>();

        async Task<PkmFileEntity> pkmVersionToPkmFileEntity(PkmVersionEntity pkmVersion)
        {
            var filepath = pkmVersion.Filepath;

            byte[] bytes = [];
            PKMLoadError? error = null;
            try
            {
                var (TooSmall, TooBig) = fileIOService.CheckGameFile(filepath);

                if (TooBig)
                    throw new PKMLoadException(PKMLoadError.TOO_BIG);

                if (TooSmall)
                    throw new PKMLoadException(PKMLoadError.TOO_SMALL);

                bytes = fileIOService.ReadBytes(filepath);
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex);
                error = PkmFileLoader.GetPKMLoadError(ex);
            }

            return new PkmFileEntity(
                Filepath: filepath,
                Data: bytes,
                Error: error,
                Updated: false,
                Deleted: false
            );
        }

        await pkmFiles.AddRangeAsync(
            await Task.WhenAll(pkmVersions.Select(
                pkmVersionToPkmFileEntity
            )),
        cancelToken);

        await db.SaveChangesAsync(cancelToken);
    }
}
