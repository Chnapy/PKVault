using System.Text;
using PKHeX.Core;

public class StorageService
{
    private static DataLoader dataLoader = new DataFileLoader(null);

    public static void CreateSession(uint saveId)
    {
        var saveInfos = SaveInfosEntity.GetSaveInfosEntity(saveId)!;
        var save = SaveUtil.GetVariantSAV(saveInfos.Filepath)!;

        dataLoader = new DataMemoryLoader(save);
    }

    public static List<BoxDTO> GetAllBoxes()
    {
        var boxLoader = dataLoader.GetUpdatedData().boxLoader;
        var entities = boxLoader.GetAllEntities();

        var list = new List<BoxDTO>();
        entities.ForEach((entity) => list.Add(BoxDTO.FromEntity(entity)));

        return list;
    }

    public static List<PkmDTO> GetPkms()
    {
        var pkmLoader = dataLoader.GetUpdatedData().pkmLoader;
        var entities = pkmLoader.GetAllEntities();

        var list = new List<PkmDTO>();
        entities.ForEach((entity) => list.Add(PkmDTO.FromEntity(entity)));

        return list;
    }

    public static List<PkmVersionDTO> GetPkmVersions(uint pkmId)
    {
        var loaders = dataLoader.GetUpdatedData();
        var entities = loaders.pkmVersionLoader.GetAllEntities().FindAll(pkmVersion => pkmVersion.PkmId == pkmId);

        var list = new List<PkmVersionDTO>();
        entities.ForEach((entity) =>
        {
            var pkm = loaders.storagePkmByPaths.Invoke(entity.Filepath);
            var dto = PkmVersionDTO.FromEntity(entity, pkm);
            list.Add(dto);
        });

        return list;
    }

    public static List<PkmSaveDTO> GetSavePkms()
    {
        return dataLoader.GetUpdatedData().pkmSaveLoader.GetAllEntities();
    }

    public static PkmDTO UpdatePkm(PkmDTO pkm)
    {
        dataLoader.AddAction(
            new PkmUpdateAction(PkmEntity.FromDTO(pkm))
        );

        return pkm;
    }

    public static void MovePkmFromSaveToStorage(long savePkmId, uint storageBoxId, uint storageSlot)
    {
        dataLoader.AddAction(
            new MovePkmSaveToStorageAction(
                savePkmId,
                storageBoxId,
                storageSlot
            )
        );
    }

    public static void MovePkmFromStorageToSave(long pkmVersionId, int saveBoxId, int saveSlot)
    {
        dataLoader.AddAction(
            new MovePkmStorageToSaveAction(
                pkmVersionId,
                saveBoxId,
                saveSlot
            )
        );
    }

    public static void Test()
    {
        // DexService.ClearDex();

        Console.WriteLine("TEST");

        var lastSavesInfos = SaveInfosEntity.GetLastSaveInfosEntity();
        // lastSavesInfos.ForEach(entity =>
        // {

        //     var save = SaveUtil.GetVariantSAV(entity.Filepath)!;
        //     DexService.UpdateDexWithSave(save, entity);


        // });

        var saveInfos = lastSavesInfos[5];
        var save = SaveUtil.GetVariantSAV(saveInfos.Filepath)!;

        Console.WriteLine($"SAVE GEN {save.Generation} VERSION {save.Version}");

        var pkms = save.GetAllPKM();

        var pkm = pkms.Find(pk => pk.Species < 150)!;
        pkm.RefreshChecksum();
        var binaries = pkm.DecryptedBoxData;
        var filename = $"pkm/{pkm.Generation}/{pkm.FileName}";

        Console.WriteLine($"{pkm.Generation} - {pkm.Species} - {GameInfo.Strings.Species[pkm.Species]} - valid:{pkm.Valid}");

        // ReportPKM(pkm);

        // File.WriteAllBytes("foo.txt", binaries, Encoding.UTF8);
        // var bytes = File.ReadAllBytes("foo.txt");
        // var pkmTest = save.GetDecryptedPKM(bytes);
        // Console.WriteLine($"TEST decrypt: {pkmTest.Generation} - {pkmTest.Species} - {GameInfo.Strings.Species[pkmTest.Species]} - valid:{pkmTest.Valid}");

        var pkm2tmp = new PK1();
        // save.GetDecryptedPKM()
        EntityConverter.AllowIncompatibleConversion = EntityCompatibilitySetting.AllowIncompatibleSane;
        var converted = EntityConverter.TryMakePKMCompatible(
            pkm,
            pkm2tmp,
            out var result,
            out var pkm2
        );

        // ReportPKM(pkm2);

        // pkm2.RefreshChecksum();
        // var binaries2 = pkm2.DecryptedPartyData;
        // var filename2 = $"pkm/{pkm2.Generation}/{pkm2.FileName}";

        // Console.WriteLine($"convert:{converted} - result:{result}");
        // Console.WriteLine($"{pkm2.Generation} - {pkm2.Species} - {GameInfo.Strings.Species[pkm2.Species]} - valid:{pkm2.Valid}");

        // File.WriteAllBytes(filename, binaries);
        // File.WriteAllBytes(filename2, binaries2);

    }

    private static void ReportPKM(PKM pkm)
    {

        var la = new LegalityAnalysis(pkm);

        Console.WriteLine();
        Console.WriteLine($"ANALYZE PKM FROM GEN {pkm.Generation}");

        if (pkm.Species == 0)
        {
            Console.WriteLine("Given PKM is fully broken");
        }
        else
        {
            pkm.RefreshChecksum();
            var stats = pkm.GetStats(pkm.PersonalInfo);

            Console.WriteLine($"{pkm.Species}-{GameInfo.Strings.Species[pkm.Species]}");
            Console.WriteLine($"EGG: {pkm.IsEgg}");
            Console.WriteLine($"LVL {pkm.CurrentLevel} - XP {pkm.EXP} - STATS: {stats[0]}/{stats[1]}/{stats[2]}/{stats[3]}/{stats[4]}/{stats[5]}");
            Console.WriteLine($"IVs: {pkm.IV_HP}/{pkm.IV_ATK}/{pkm.IV_DEF}/{pkm.IV_SPA}/{pkm.IV_SPD}/{pkm.IV_SPE} - EVs: {pkm.EV_HP}/{pkm.EV_ATK}/{pkm.EV_DEF}/{pkm.EV_SPA}/{pkm.EV_SPD}/{pkm.EV_SPE}");
            Console.WriteLine($"NATURE {pkm.Nature} - ABILITY {(pkm.Ability == -1 ? "NONE" : GameInfo.Strings.Ability[pkm.Ability])}");
            Console.WriteLine($"MOVES: {GameInfo.Strings.Move[pkm.Move1]}/{GameInfo.Strings.Move[pkm.Move2]}/{GameInfo.Strings.Move[pkm.Move3]}/{GameInfo.Strings.Move[pkm.Move4]}");
            Console.WriteLine($"ORIGIN {pkm.OriginalTrainerName} {pkm.MetDate} LVL{pkm.MetLevel} {GameInfo.Strings.GetLocationName(
                pkm.WasEgg,
                pkm.MetLocation,
                pkm.Format,
                pkm.Generation,
                pkm.Version
            )}");
            Console.WriteLine($"LEGALITY: {la.Report(true)}");

        }

        Console.WriteLine($"ANALYZE FINISHED");
        Console.WriteLine();
    }
}
