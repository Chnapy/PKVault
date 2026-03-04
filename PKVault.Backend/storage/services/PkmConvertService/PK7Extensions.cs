
using PKHeX.Core;

public static class PK7Extensions
{
    public static PK8 ConvertToPK8(this PK7 pk7)
    {
        var pk8 = new PK8()
        {
            Version = pk7.Version,
            MetLocation = 30001,
            MetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pk7.MetLevel,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),

            HandlingTrainerLanguage = (byte)pk7.Language,
        };

        pk8.CopyCommonPropertiesFrom(pk7, 8);
        pk8.CopyIVsFrom(pk7);
        pk8.CopyEVsFrom(pk7);

        pk7.CopyContestStatsTo(pk8);

        pk7.CopyRibbonSetCommon3(pk8);
        pk7.CopyRibbonSetEvent3(pk8);
        pk7.CopyRibbonSetCommon4(pk8);
        pk7.CopyRibbonSetEvent4(pk8);
        pk7.CopyRibbonSetCommon6(pk8);
        pk7.CopyRibbonSetMemory6(pk8);
        pk7.CopyRibbonSetCommon7(pk8);

        pk8.CopyHeldItemFrom(pk7.HeldItem, pk7.Context, pk7.Version);

        pk8.FixAbility();

        pk8.FixMetLocation([
            GameVersion.S, GameVersion.R, GameVersion.E, GameVersion.FR, GameVersion.LG, GameVersion.CXD,
            GameVersion.D, GameVersion.P, GameVersion.Pt, GameVersion.SS, GameVersion.HG,
            GameVersion.B, GameVersion.W, GameVersion.B2, GameVersion.W2,
            GameVersion.X, GameVersion.Y, GameVersion.OR, GameVersion.AS,
            GameVersion.SN, GameVersion.MN, GameVersion.US, GameVersion.UM,
            GameVersion.SW, GameVersion.SH, GameVersion.BD, GameVersion.SP, GameVersion.PLA,
        ]);

        pk8.FixPID(pk7.IsShiny, pk7.Form, pk7.Gender, pk7.Nature);

        pk8.CopyMovesFrom(pk7);

        // for Furfrou and Hoopa
        pk8.FormArgumentRemain = pk7.FormArgumentRemain;
        pk8.FormArgumentElapsed = pk7.FormArgumentElapsed;
        pk8.FormArgumentMaximum = pk7.FormArgumentMaximum;

        return pk8;
    }

    public static PB7 ConvertToPB7(this PK7 pk7)
    {
        byte convertEVToAV(float value) => byte.Max((byte)(value / pk7.MaxEV * 200), 2);

        int convertIVOdd(int value) => (value % 2) == 0
            ? value + 1
            : value;

        var ivAtkSpa = int.Max(
            convertIVOdd(pk7.IV_ATK),
            convertIVOdd(pk7.IV_SPA)
        );
        var ivDefSpd = int.Max(
            convertIVOdd(pk7.IV_DEF),
            convertIVOdd(pk7.IV_SPD)
        );

        var pb7 = new PB7()
        {
            ResortEventStatus = 0, // Clears old Marking Value
            MarkingValue = 0, // Clears old Super Training Bag & Hits Remaining
            HyperTrainFlags = 0, // Clears old Gen4 Encounter Type byte
            FormArgument = 0, // Clears old style Form Argument
            DirtType = 0, // Clears old FormArgumentRemain byte
            DirtLocation = 0, // Clears old FormArgumentElapsed byte

            Version = GameVersion.GO,
            MetLocation = Locations.GO7,
            MetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pk7.CurrentLevel,

            ReceivedDate = EncounterDate.GetDateSwitch(),

            /**
             * IV rules with PB7:
             * - HP, ATK, DEF, SPA, SPD should be odd
             * - ATK = SPA
             * - DEF = SPD
             */
            IVs = [
                convertIVOdd(pk7.IV_HP),
                ivAtkSpa,
                ivDefSpd,
                pk7.IV_SPE,
                ivAtkSpa,
                ivDefSpd,
            ],

            AV_HP = convertEVToAV(pk7.EV_HP),
            AV_ATK = convertEVToAV(pk7.EV_ATK),
            AV_DEF = convertEVToAV(pk7.EV_DEF),
            AV_SPA = convertEVToAV(pk7.EV_SPA),
            AV_SPD = convertEVToAV(pk7.EV_SPD),
            AV_SPE = convertEVToAV(pk7.EV_SPE),

        };

        pb7.CopyCommonPropertiesFrom(pk7, 7);

        pb7.CopyMovesFrom(pk7);

        // pb7.FixMetLocation([
        //     // GameVersion.RD, GameVersion.GN, GameVersion.BU, GameVersion.YW,
        //     // GameVersion.GD, GameVersion.SI, GameVersion.C,
        //     GameVersion.GP, GameVersion.GE,
        //     GameVersion.GO,
        // ]);

        pb7.ResetCalculatedValues();

        return pb7;
    }

    public static PK6 ConvertToPK6(this PK7 pk7)
    {
        var pk6 = new PK6()
        {
            Version = GameVersion.X,
            MetLocation = 30001,
            MetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pk7.MetLevel,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),
        };

        pk6.CopyCommonPropertiesFrom(pk7, 6);
        pk6.CopyIVsFrom(pk7);
        pk6.CopyEVsFrom(pk7);

        pk7.CopyContestStatsTo(pk6);

        pk7.CopyRibbonSetCommon3(pk6);
        pk7.CopyRibbonSetEvent3(pk6);
        pk7.CopyRibbonSetCommon4(pk6);
        pk7.CopyRibbonSetEvent4(pk6);
        pk7.CopyRibbonSetCommon6(pk6);
        pk7.CopyRibbonSetMemory6(pk6);

        pk6.CopyHeldItemFrom(pk7.HeldItem, pk7.Context, pk7.Version);

        pk6.FixAbility();

        pk6.FixMetLocation([GameVersion.X, GameVersion.Y, GameVersion.AS, GameVersion.OR]);

        pk6.FixPID(pk7.IsShiny, pk7.Form, pk7.Gender, pk7.Nature);

        // for Furfrou and Hoopa
        pk6.FormArgumentRemain = pk7.FormArgumentRemain;
        pk6.FormArgumentElapsed = pk7.FormArgumentElapsed;
        pk6.FormArgumentMaximum = pk7.FormArgumentMaximum;

        pk6.CopyMovesFrom(pk7);

        return pk6;
    }

    public static PK7 ConvertToPK7(this PB7 pb7)
    {
        byte convertAVToEV(float value) => (byte)(value * EffortValues.Max252 / 200);

        var pk7 = new PK7()
        {
            Version = GameVersion.SN,
            MetLocation = 30001,
            MetDate = pb7.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pb7.MetLevel,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),

            EV_HP = convertAVToEV(pb7.AV_HP),
            EV_ATK = convertAVToEV(pb7.AV_ATK),
            EV_DEF = convertAVToEV(pb7.AV_DEF),
            EV_SPA = convertAVToEV(pb7.AV_SPA),
            EV_SPD = convertAVToEV(pb7.AV_SPD),
            EV_SPE = convertAVToEV(pb7.AV_SPE),
        };

        pk7.CopyCommonPropertiesFrom(pb7, 7);
        pk7.CopyIVsFrom(pb7);

        pb7.CopyRibbonSetCommon3(pk7);
        pb7.CopyRibbonSetEvent3(pk7);
        pb7.CopyRibbonSetCommon4(pk7);
        pb7.CopyRibbonSetEvent4(pk7);
        pb7.CopyRibbonSetCommon6(pk7);
        pb7.CopyRibbonSetMemory6(pk7);
        pb7.CopyRibbonSetCommon7(pk7);

        pk7.CopyHeldItemFrom(pb7.HeldItem, pb7.Context, pb7.Version);

        pk7.FixAbility();

        pk7.FixMetLocation([GameVersion.SN, GameVersion.MN, GameVersion.US, GameVersion.UM]);

        pk7.FixPID(pb7.IsShiny, pb7.Form, pb7.Gender, pb7.Nature);

        pk7.CopyMovesFrom(pb7);

        // for Furfrou and Hoopa
        pk7.FormArgumentRemain = pb7.FormArgumentRemain;
        pk7.FormArgumentElapsed = pb7.FormArgumentElapsed;
        pk7.FormArgumentMaximum = pb7.FormArgumentMaximum;

        return pk7;
    }
}
