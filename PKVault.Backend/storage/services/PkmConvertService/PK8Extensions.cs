
using PKHeX.Core;

public static class PK8Extensions
{
    public static PK9 ConvertToPK9(this PK8 pk8, PKMRndValues? rndValues)
    {
        var pk9 = new PK9()
        {
            Version = pk8.Version,
            MetLocation = pk8.MetLocation,
            MetDate = pk8.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pk8.MetLevel,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),

            HeightScalar = byte.Max(pk8.HeightScalar, 1),
            WeightScalar = byte.Max(pk8.WeightScalar, 1),

            ObedienceLevel = pk8.CurrentLevel,
            TeraTypeOriginal = (MoveType)Tera9RNG.GetTeraTypeFromPersonal(pk8.Species, pk8.Form, 0),
            TeraTypeOverride = (MoveType)Tera9RNG.GetTeraTypeFromPersonal(pk8.Species, pk8.Form, 0),
        };

        pk9.CopyCommonPropertiesFrom(pk8, 9, rndValues);
        pk9.CopyIVsFrom(pk8);
        pk9.CopyEVsFrom(pk8);

        for (var i = 0; i < pk9.MarkingCount; i++)
        {
            pk9.SetMarking(i, pk8.GetMarking(i));
        }

        pk8.CopyContestStatsTo(pk9);

        pk8.CopyRibbonSetCommon3(pk9);
        pk8.CopyRibbonSetEvent3(pk9);
        pk8.CopyRibbonSetCommon4(pk9);
        pk8.CopyRibbonSetEvent4(pk9);
        pk8.CopyRibbonSetCommon6(pk9);
        pk8.CopyRibbonSetMemory6(pk9);
        pk8.CopyRibbonSetCommon7(pk9);

        pk9.CopyHeldItemFrom(pk8.HeldItem, pk8.Context, pk8.Version);

        pk9.FixAbility();

        pk9.FixMetLocation([
            GameVersion.S, GameVersion.R, GameVersion.E, GameVersion.FR, GameVersion.LG, GameVersion.CXD,
            GameVersion.D, GameVersion.P, GameVersion.Pt, GameVersion.SS, GameVersion.HG,
            GameVersion.B, GameVersion.W, GameVersion.B2, GameVersion.W2,
            GameVersion.X, GameVersion.Y, GameVersion.OR, GameVersion.AS,
            GameVersion.SN, GameVersion.MN, GameVersion.US, GameVersion.UM,
            GameVersion.SW, GameVersion.SH, GameVersion.BD, GameVersion.SP, GameVersion.PLA,
            GameVersion.SL, GameVersion.VL,
        ]);

        if (rndValues == null)
            pk9.FixPID(pk8.IsShiny, pk8.Form, pk8.Gender, pk8.Nature);

        pk9.CopyMovesFrom(pk8);

        return pk9;
    }

    public static PB8 ConvertToPB8(this PK8 pk8, PKMRndValues? rndValues)
    {
        var pb8 = new PB8()
        {
            Version = pk8.Version,
            MetLocation = pk8.MetLocation,
            MetDate = pk8.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pk8.MetLevel,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),
        };

        pb8.CopyCommonPropertiesFrom(pk8, 8, rndValues);
        pb8.CopyIVsFrom(pk8);
        pb8.CopyEVsFrom(pk8);

        for (var i = 0; i < pk8.MarkingCount; i++)
        {
            pb8.SetMarking(i, pk8.GetMarking(i));
        }

        pk8.CopyContestStatsTo(pb8);

        pk8.CopyRibbonSetCommon3(pb8);
        pk8.CopyRibbonSetEvent3(pb8);
        pk8.CopyRibbonSetCommon4(pb8);
        pk8.CopyRibbonSetEvent4(pb8);
        pk8.CopyRibbonSetCommon6(pb8);
        pk8.CopyRibbonSetMemory6(pb8);
        pk8.CopyRibbonSetCommon7(pb8);

        pb8.CopyHeldItemFrom(pk8.HeldItem, pk8.Context, pk8.Version);

        pb8.FixAbility();

        pb8.FixMetLocation([
            GameVersion.S, GameVersion.R, GameVersion.E, GameVersion.FR, GameVersion.LG, GameVersion.CXD,
            GameVersion.D, GameVersion.P, GameVersion.Pt, GameVersion.SS, GameVersion.HG,
            GameVersion.B, GameVersion.W, GameVersion.B2, GameVersion.W2,
            GameVersion.X, GameVersion.Y, GameVersion.OR, GameVersion.AS,
            GameVersion.SN, GameVersion.MN, GameVersion.US, GameVersion.UM,
            GameVersion.SW, GameVersion.SH, GameVersion.BD, GameVersion.SP, GameVersion.PLA,
        ]);

        if (rndValues == null)
            pb8.FixPID(pk8.IsShiny, pk8.Form, pk8.Gender, pk8.Nature);

        pb8.CopyMovesFrom(pk8);

        return pb8;
    }

    public static PA8 ConvertToPA8(this PK8 pk8, PKMRndValues? rndValues)
    {
        var pa8 = new PA8()
        {
            Version = pk8.Version,
            MetLocation = pk8.MetLocation,
            MetDate = pk8.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pk8.MetLevel,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),
        };

        pa8.CopyCommonPropertiesFrom(pk8, 8, rndValues);
        pa8.CopyIVsFrom(pk8);
        pa8.CopyEVsFrom(pk8);

        for (var i = 0; i < pk8.MarkingCount; i++)
        {
            pa8.SetMarking(i, pk8.GetMarking(i));
        }

        pk8.CopyContestStatsTo(pa8);

        pk8.CopyRibbonSetCommon3(pa8);
        pk8.CopyRibbonSetEvent3(pa8);
        pk8.CopyRibbonSetCommon4(pa8);
        pk8.CopyRibbonSetEvent4(pa8);
        pk8.CopyRibbonSetCommon6(pa8);
        pk8.CopyRibbonSetMemory6(pa8);
        pk8.CopyRibbonSetCommon7(pa8);

        pa8.FixAbility();

        pa8.FixMetLocation([
            GameVersion.S, GameVersion.R, GameVersion.E, GameVersion.FR, GameVersion.LG, GameVersion.CXD,
            GameVersion.D, GameVersion.P, GameVersion.Pt, GameVersion.SS, GameVersion.HG,
            GameVersion.B, GameVersion.W, GameVersion.B2, GameVersion.W2,
            GameVersion.X, GameVersion.Y, GameVersion.OR, GameVersion.AS,
            GameVersion.SN, GameVersion.MN, GameVersion.US, GameVersion.UM,
            GameVersion.SW, GameVersion.SH, GameVersion.BD, GameVersion.SP, GameVersion.PLA,
        ]);

        if (rndValues == null)
            pa8.FixPID(pk8.IsShiny, pk8.Form, pk8.Gender, pk8.Nature);

        pa8.CopyMovesFrom(pk8);

        pa8.ResetHeight();
        pa8.ResetWeight();

        return pa8;
    }

    public static PK7 ConvertToPK7(this PK8 pk8, PKMRndValues? rndValues)
    {
        var pk7 = new PK7()
        {
            Version = GameVersion.SN,
            MetLocation = 30001,
            MetDate = pk8.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pk8.MetLevel,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),
        };

        pk7.CopyCommonPropertiesFrom(pk8, 7, rndValues);
        pk7.CopyIVsFrom(pk8);
        pk7.CopyEVsFrom(pk8);

        pk8.CopyContestStatsTo(pk7);

        pk8.CopyRibbonSetCommon3(pk7);
        pk8.CopyRibbonSetEvent3(pk7);
        pk8.CopyRibbonSetCommon4(pk7);
        pk8.CopyRibbonSetEvent4(pk7);
        pk8.CopyRibbonSetCommon6(pk7);
        pk8.CopyRibbonSetMemory6(pk7);
        pk8.CopyRibbonSetCommon7(pk7);

        pk7.CopyHeldItemFrom(pk8.HeldItem, pk8.Context, pk8.Version);

        pk7.FixAbility();

        pk7.FixMetLocation([GameVersion.SN, GameVersion.MN, GameVersion.US, GameVersion.UM]);

        if (rndValues == null)
            pk7.FixPID(pk8.IsShiny, pk8.Form, pk8.Gender, pk8.Nature);

        pk7.CopyMovesFrom(pk8);

        // for Furfrou and Hoopa
        pk7.FormArgumentRemain = pk8.FormArgumentRemain;
        pk7.FormArgumentElapsed = pk8.FormArgumentElapsed;
        pk7.FormArgumentMaximum = pk8.FormArgumentMaximum;

        return pk7;
    }

    public static PK8 ConvertToPK8(this PB8 pb8, PKMRndValues? rndValues)
    {
        var pk8 = new PK8()
        {
            Version = GameVersion.SW,
            MetLocation = 30001,
            MetDate = pb8.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pb8.MetLevel,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),

            HandlingTrainerLanguage = (byte)pb8.Language,
        };

        pk8.CopyCommonPropertiesFrom(pb8, 8, rndValues);
        pk8.CopyIVsFrom(pb8);
        pk8.CopyEVsFrom(pb8);

        pb8.CopyContestStatsTo(pk8);

        pb8.CopyRibbonSetCommon3(pk8);
        pb8.CopyRibbonSetEvent3(pk8);
        pb8.CopyRibbonSetCommon4(pk8);
        pb8.CopyRibbonSetEvent4(pk8);
        pb8.CopyRibbonSetCommon6(pk8);
        pb8.CopyRibbonSetMemory6(pk8);
        pb8.CopyRibbonSetCommon7(pk8);

        pk8.CopyHeldItemFrom(pb8.HeldItem, pb8.Context, pb8.Version);

        pk8.FixAbility();

        pk8.FixMetLocation([GameVersion.SW, GameVersion.SH]);

        if (rndValues == null)
            pk8.FixPID(pb8.IsShiny, pb8.Form, pb8.Gender, pb8.Nature);

        // for Furfrou and Hoopa
        pk8.FormArgumentRemain = pb8.FormArgumentRemain;
        pk8.FormArgumentElapsed = pb8.FormArgumentElapsed;
        pk8.FormArgumentMaximum = pb8.FormArgumentMaximum;

        pk8.CopyMovesFrom(pb8);

        return pk8;
    }

    public static PK8 ConvertToPK8(this PA8 pa8, PKMRndValues? rndValues)
    {
        var pk8 = new PK8()
        {
            Version = GameVersion.SW,
            MetLocation = 30001,
            MetDate = pa8.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pa8.MetLevel,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),

            HandlingTrainerLanguage = (byte)pa8.Language,
        };

        pk8.CopyCommonPropertiesFrom(pa8, 8, rndValues);
        pk8.CopyIVsFrom(pa8);
        pk8.CopyEVsFrom(pa8);

        pa8.CopyContestStatsTo(pk8);

        pa8.CopyRibbonSetCommon3(pk8);
        pa8.CopyRibbonSetEvent3(pk8);
        pa8.CopyRibbonSetCommon4(pk8);
        pa8.CopyRibbonSetEvent4(pk8);
        pa8.CopyRibbonSetCommon6(pk8);
        pa8.CopyRibbonSetMemory6(pk8);
        pa8.CopyRibbonSetCommon7(pk8);

        pk8.CopyHeldItemFrom(pa8.HeldItem, pa8.Context, pa8.Version);

        pk8.FixAbility();

        pk8.FixMetLocation([GameVersion.SW, GameVersion.SH]);

        if (rndValues == null)
            pk8.FixPID(pa8.IsShiny, pa8.Form, pa8.Gender, pa8.Nature);

        // for Furfrou and Hoopa
        pk8.FormArgumentRemain = pa8.FormArgumentRemain;
        pk8.FormArgumentElapsed = pa8.FormArgumentElapsed;
        pk8.FormArgumentMaximum = pa8.FormArgumentMaximum;

        pk8.CopyMovesFrom(pa8);

        return pk8;
    }
}
