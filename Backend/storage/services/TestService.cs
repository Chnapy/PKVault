using System.Text;
using PKHeX.Core;

public class TestService
{
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

        // onix G4 - PK4
        var pkmG4 = pkms.Find(pk => pk.Species < 150)!;
        pkmG4.RefreshChecksum();
        ReportLinePKM(pkmG4, "memory");

        // ReportPKM(pkm);

        // Write & read G4-PK4 to file
        var binariesG4 = pkmG4.Data;
        var filenameG4 = $"pkm/{pkmG4.Generation}/{pkmG4.FileName}";
        File.WriteAllBytes(filenameG4, binariesG4);
        var checkFileBytesG4 = File.ReadAllBytes(filenameG4);
        var pkmG4FromFile = new PK4(checkFileBytesG4);
        ReportLinePKM(pkmG4FromFile, "file");

        // Convert G4-PK4 to G1-PK1
        EntityConverter.AllowIncompatibleConversion = EntityCompatibilitySetting.AllowIncompatibleSane;
        var converted = EntityConverter.TryMakePKMCompatible(
            pkmG4,
            new PK1(),
            out var result,
            out var pkmG1
        );
        ReportLinePKM(pkmG1, "memory-converted");

        // Write & read G1-PK1 to file
        var binariesG1 = pkmG1.Data;
        var filenameG1 = $"pkm/{pkmG1.Generation}/{pkmG1.FileName}";
        File.WriteAllBytes(filenameG1, binariesG1);
        var checkFileBytesG1 = File.ReadAllBytes(filenameG1);
        var pkmG1FromFile = new PK1(checkFileBytesG1);
        ReportLinePKM(pkmG1FromFile, "file-converted");

        // ReportPKM(pkm2);

        // pkm2.RefreshChecksum();
        // var binaries2 = pkm2.DecryptedPartyData;
        // var filename2 = $"pkm/{pkm2.Generation}/{pkm2.FileName}";

        // Console.WriteLine($"convert:{converted} - result:{result}");
        // Console.WriteLine($"{pkm2.Generation} - {pkm2.Species} - {GameInfo.Strings.Species[pkm2.Species]} - valid:{pkm2.Valid}");

        // File.WriteAllBytes(filename, binaries);
        // File.WriteAllBytes(filename2, binaries2);

    }

    private static void ReportLinePKM(PKM pkm, string type)
    {
        Console.WriteLine($"PKM({type}) gen={pkm.Generation} - species={pkm.Species} - {GameInfo.Strings.Species[pkm.Species]} - valid={pkm.Valid}");
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
