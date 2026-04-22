
using PKHeX.Core;

public class PK8Converter(PKMConverterUtils utils)
{
    public PK9 ConvertToPK9(PK8 pk8, PKMRndValues? rndValues)
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

            PokerusState = pk8.PokerusState,
        };

        utils.CopyCommonPropertiesFrom(pk9, pk8, 9, rndValues);
        utils.CopyIVsFrom(pk9, pk8);
        utils.CopyEVsFrom(pk9, pk8);

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

        utils.CopyHeldItemFrom(pk9, pk8.HeldItem, pk8.Context, pk8.Version);

        utils.FixAbility(pk9);

        utils.FixMetLocation(pk9, [
            GameVersion.S, GameVersion.R, GameVersion.E, GameVersion.FR, GameVersion.LG, GameVersion.CXD,
            GameVersion.D, GameVersion.P, GameVersion.Pt, GameVersion.SS, GameVersion.HG,
            GameVersion.B, GameVersion.W, GameVersion.B2, GameVersion.W2,
            GameVersion.X, GameVersion.Y, GameVersion.OR, GameVersion.AS,
            GameVersion.SN, GameVersion.MN, GameVersion.US, GameVersion.UM,
            GameVersion.SW, GameVersion.SH, GameVersion.BD, GameVersion.SP, GameVersion.PLA,
            GameVersion.SL, GameVersion.VL,
        ]);

        if (rndValues == null)
            utils.FixPID(pk9, pk8.IsShiny, pk8.Form, pk8.Gender, pk8.Nature);

        utils.CopyMovesFrom(pk9, pk8);

        return pk9;
    }

    public PB8 ConvertToPB8(PK8 pk8, PKMRndValues? rndValues)
    {
        var pb8 = new PB8()
        {
            Version = pk8.Version,
            MetLocation = pk8.MetLocation,
            MetDate = pk8.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pk8.MetLevel,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),

            PokerusState = pk8.PokerusState,
        };

        utils.CopyCommonPropertiesFrom(pb8, pk8, 8, rndValues);
        utils.CopyIVsFrom(pb8, pk8);
        utils.CopyEVsFrom(pb8, pk8);

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

        utils.CopyHeldItemFrom(pb8, pk8.HeldItem, pk8.Context, pk8.Version);

        utils.FixAbility(pb8);

        utils.FixMetLocation(pb8, [
            GameVersion.S, GameVersion.R, GameVersion.E, GameVersion.FR, GameVersion.LG, GameVersion.CXD,
            GameVersion.D, GameVersion.P, GameVersion.Pt, GameVersion.SS, GameVersion.HG,
            GameVersion.B, GameVersion.W, GameVersion.B2, GameVersion.W2,
            GameVersion.X, GameVersion.Y, GameVersion.OR, GameVersion.AS,
            GameVersion.SN, GameVersion.MN, GameVersion.US, GameVersion.UM,
            GameVersion.SW, GameVersion.SH, GameVersion.BD, GameVersion.SP, GameVersion.PLA,
        ]);

        if (rndValues == null)
            utils.FixPID(pb8, pk8.IsShiny, pk8.Form, pk8.Gender, pk8.Nature);

        utils.CopyMovesFrom(pb8, pk8);

        return pb8;
    }

    public PA8 ConvertToPA8(PK8 pk8, PKMRndValues? rndValues)
    {
        var pa8 = new PA8()
        {
            Version = pk8.Version,
            MetLocation = pk8.MetLocation,
            MetDate = pk8.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pk8.MetLevel,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),

            PokerusState = pk8.PokerusState,
        };

        utils.CopyCommonPropertiesFrom(pa8, pk8, 8, rndValues);
        utils.CopyIVsFrom(pa8, pk8);
        utils.CopyEVsFrom(pa8, pk8);

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

        utils.FixAbility(pa8);

        utils.FixMetLocation(pa8, [
            GameVersion.S, GameVersion.R, GameVersion.E, GameVersion.FR, GameVersion.LG, GameVersion.CXD,
            GameVersion.D, GameVersion.P, GameVersion.Pt, GameVersion.SS, GameVersion.HG,
            GameVersion.B, GameVersion.W, GameVersion.B2, GameVersion.W2,
            GameVersion.X, GameVersion.Y, GameVersion.OR, GameVersion.AS,
            GameVersion.SN, GameVersion.MN, GameVersion.US, GameVersion.UM,
            GameVersion.SW, GameVersion.SH, GameVersion.BD, GameVersion.SP, GameVersion.PLA,
        ]);

        if (rndValues == null)
            utils.FixPID(pa8, pk8.IsShiny, pk8.Form, pk8.Gender, pk8.Nature);

        utils.CopyMovesFrom(pa8, pk8);

        pa8.ResetHeight();
        pa8.ResetWeight();

        return pa8;
    }

    public PK7 ConvertToPK7(PK8 pk8, PKMRndValues? rndValues)
    {
        var pk7 = new PK7()
        {
            Version = GameVersion.SN,
            MetLocation = 30001,
            MetDate = pk8.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pk8.MetLevel,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),

            PokerusState = pk8.PokerusState,
        };

        utils.CopyCommonPropertiesFrom(pk7, pk8, 7, rndValues);
        utils.CopyIVsFrom(pk7, pk8);
        utils.CopyEVsFrom(pk7, pk8);

        pk8.CopyContestStatsTo(pk7);

        pk8.CopyRibbonSetCommon3(pk7);
        pk8.CopyRibbonSetEvent3(pk7);
        pk8.CopyRibbonSetCommon4(pk7);
        pk8.CopyRibbonSetEvent4(pk7);
        pk8.CopyRibbonSetCommon6(pk7);
        pk8.CopyRibbonSetMemory6(pk7);
        pk8.CopyRibbonSetCommon7(pk7);

        utils.CopyHeldItemFrom(pk7, pk8.HeldItem, pk8.Context, pk8.Version);

        utils.FixAbility(pk7);

        utils.FixMetLocation(pk7, [GameVersion.SN, GameVersion.MN, GameVersion.US, GameVersion.UM]);

        if (rndValues == null)
            utils.FixPID(pk7, pk8.IsShiny, pk8.Form, pk8.Gender, pk8.Nature);

        utils.CopyMovesFrom(pk7, pk8);

        // for Furfrou and Hoopa
        pk7.FormArgumentRemain = pk8.FormArgumentRemain;
        pk7.FormArgumentElapsed = pk8.FormArgumentElapsed;
        pk7.FormArgumentMaximum = pk8.FormArgumentMaximum;

        return pk7;
    }

    public PK8 ConvertToPK8(PB8 pb8, PKMRndValues? rndValues)
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

            PokerusState = pb8.PokerusState,
        };

        utils.CopyCommonPropertiesFrom(pk8, pb8, 8, rndValues);
        utils.CopyIVsFrom(pk8, pb8);
        utils.CopyEVsFrom(pk8, pb8);

        pb8.CopyContestStatsTo(pk8);

        pb8.CopyRibbonSetCommon3(pk8);
        pb8.CopyRibbonSetEvent3(pk8);
        pb8.CopyRibbonSetCommon4(pk8);
        pb8.CopyRibbonSetEvent4(pk8);
        pb8.CopyRibbonSetCommon6(pk8);
        pb8.CopyRibbonSetMemory6(pk8);
        pb8.CopyRibbonSetCommon7(pk8);

        utils.CopyHeldItemFrom(pk8, pb8.HeldItem, pb8.Context, pb8.Version);

        utils.FixAbility(pk8);

        utils.FixMetLocation(pk8, [GameVersion.SW, GameVersion.SH]);

        if (rndValues == null)
            utils.FixPID(pk8, pb8.IsShiny, pb8.Form, pb8.Gender, pb8.Nature);

        // for Furfrou and Hoopa
        pk8.FormArgumentRemain = pb8.FormArgumentRemain;
        pk8.FormArgumentElapsed = pb8.FormArgumentElapsed;
        pk8.FormArgumentMaximum = pb8.FormArgumentMaximum;

        utils.CopyMovesFrom(pk8, pb8);

        return pk8;
    }

    public PK8 ConvertToPK8(PA8 pa8, PKMRndValues? rndValues)
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

            PokerusState = pa8.PokerusState,
        };

        utils.CopyCommonPropertiesFrom(pk8, pa8, 8, rndValues);
        utils.CopyIVsFrom(pk8, pa8);
        utils.CopyEVsFrom(pk8, pa8);

        pa8.CopyContestStatsTo(pk8);

        pa8.CopyRibbonSetCommon3(pk8);
        pa8.CopyRibbonSetEvent3(pk8);
        pa8.CopyRibbonSetCommon4(pk8);
        pa8.CopyRibbonSetEvent4(pk8);
        pa8.CopyRibbonSetCommon6(pk8);
        pa8.CopyRibbonSetMemory6(pk8);
        pa8.CopyRibbonSetCommon7(pk8);

        utils.CopyHeldItemFrom(pk8, pa8.HeldItem, pa8.Context, pa8.Version);

        utils.FixAbility(pk8);

        utils.FixMetLocation(pk8, [GameVersion.SW, GameVersion.SH]);

        if (rndValues == null)
            utils.FixPID(pk8, pa8.IsShiny, pa8.Form, pa8.Gender, pa8.Nature);

        // for Furfrou and Hoopa
        pk8.FormArgumentRemain = pa8.FormArgumentRemain;
        pk8.FormArgumentElapsed = pa8.FormArgumentElapsed;
        pk8.FormArgumentMaximum = pa8.FormArgumentMaximum;

        utils.CopyMovesFrom(pk8, pa8);

        return pk8;
    }
}
