
using PKHeX.Core;

public static class PK9Extensions
{
    public static PA9 ConvertToPA9(this PK9 pk9)
    {
        var pa9 = new PA9()
        {
            Version = GameVersion.ZA,
            // MetLocation = pk9.MetLocation,
            MetDate = pk9.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pk9.MetLevel,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),

            HeightScalar = 0,
            WeightScalar = 0,

            ObedienceLevel = pk9.ObedienceLevel,
        };

        pa9.CopyCommonPropertiesFrom(pk9, 9);
        pa9.CopyIVsFrom(pk9);
        pa9.CopyEVsFrom(pk9);

        for (var i = 0; i < pk9.MarkingCount; i++)
        {
            pa9.SetMarking(i, pk9.GetMarking(i));
        }

        pk9.CopyContestStatsTo(pa9);

        pk9.CopyRibbonSetCommon3(pa9);
        pk9.CopyRibbonSetEvent3(pa9);
        pk9.CopyRibbonSetCommon4(pa9);
        pk9.CopyRibbonSetEvent4(pa9);
        pk9.CopyRibbonSetCommon6(pa9);
        pk9.CopyRibbonSetMemory6(pa9);
        pk9.CopyRibbonSetCommon7(pa9);

        pa9.CopyHeldItemFrom(pk9.HeldItem, pk9.Context, pk9.Version);

        pa9.FixMetLocation([GameVersion.ZA]);

        pa9.FixPID(pk9.IsShiny, pk9.Form, pk9.Gender, pk9.Nature);

        pa9.CopyMovesFrom(pk9);

        return pa9;
    }

    public static PK8 ConvertToPK8(this PK9 pk9)
    {
        var pk8 = new PK8()
        {
            Version = GameVersion.SW,
            MetLocation = 30001,
            MetDate = pk9.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pk9.MetLevel,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),

            HandlingTrainerLanguage = (byte)pk9.Language,
        };

        pk8.CopyCommonPropertiesFrom(pk9, 8);
        pk8.CopyIVsFrom(pk9);
        pk8.CopyEVsFrom(pk9);

        pk9.CopyContestStatsTo(pk8);

        pk9.CopyRibbonSetCommon3(pk8);
        pk9.CopyRibbonSetEvent3(pk8);
        pk9.CopyRibbonSetCommon4(pk8);
        pk9.CopyRibbonSetEvent4(pk8);
        pk9.CopyRibbonSetCommon6(pk8);
        pk9.CopyRibbonSetMemory6(pk8);
        pk9.CopyRibbonSetCommon7(pk8);

        pk8.CopyHeldItemFrom(pk9.HeldItem, pk9.Context, pk9.Version);

        pk8.FixAbility();

        pk8.FixMetLocation([GameVersion.SW, GameVersion.SH]);

        pk8.FixPID(pk9.IsShiny, pk9.Form, pk9.Gender, pk9.Nature);

        // for Furfrou and Hoopa
        pk8.FormArgumentRemain = pk9.FormArgumentRemain;
        pk8.FormArgumentElapsed = pk9.FormArgumentElapsed;
        pk8.FormArgumentMaximum = pk9.FormArgumentMaximum;

        pk8.CopyMovesFrom(pk9);

        return pk8;
    }

    public static PK9 ConvertToPK9(this PA9 pa9)
    {
        var pk9 = new PK9()
        {
            Version = GameVersion.SL,
            MetLocation = pa9.MetLocation,
            MetDate = pa9.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pa9.MetLevel,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),

            HeightScalar = byte.Max(pa9.HeightScalar, 1),
            WeightScalar = byte.Max(pa9.WeightScalar, 1),

            ObedienceLevel = pa9.CurrentLevel,
            TeraTypeOriginal = (MoveType)Tera9RNG.GetTeraTypeFromPersonal(pa9.Species, pa9.Form, 0),
            TeraTypeOverride = (MoveType)Tera9RNG.GetTeraTypeFromPersonal(pa9.Species, pa9.Form, 0),
        };

        pk9.CopyCommonPropertiesFrom(pa9, 9);
        pk9.CopyIVsFrom(pa9);
        pk9.CopyEVsFrom(pa9);

        for (var i = 0; i < pk9.MarkingCount; i++)
        {
            pk9.SetMarking(i, pa9.GetMarking(i));
        }

        pa9.CopyContestStatsTo(pk9);

        pa9.CopyRibbonSetCommon3(pk9);
        pa9.CopyRibbonSetEvent3(pk9);
        pa9.CopyRibbonSetCommon4(pk9);
        pa9.CopyRibbonSetEvent4(pk9);
        pa9.CopyRibbonSetCommon6(pk9);
        pa9.CopyRibbonSetMemory6(pk9);
        pa9.CopyRibbonSetCommon7(pk9);

        pk9.CopyHeldItemFrom(pa9.HeldItem, pa9.Context, pa9.Version);

        pk9.FixAbility();

        pk9.FixMetLocation([GameVersion.SL, GameVersion.VL]);

        pk9.FixPID(pa9.IsShiny, pa9.Form, pa9.Gender, pa9.Nature);

        pk9.CopyMovesFrom(pa9);

        return pk9;
    }
}
