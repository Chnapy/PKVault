
using PKHeX.Core;

namespace PKVault.Core;

public class PK9Converter(PKMConverterUtils utils)
{
    public PA9 ConvertToPA9(PK9 pk9, ConvertContext ctx)
    {
        var pa9 = new PA9()
        {
            Version = pk9.Version,
            // MetLocation = pk9.MetLocation,
            MetDate = pk9.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pk9.MetLevel,
            Ability = pk9.Ability,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),

            HeightScalar = 0,
            WeightScalar = 0,

            ObedienceLevel = pk9.ObedienceLevel,

            PokerusState = pk9.PokerusState,
        };

        utils.CopyCommonPropertiesFrom(pa9, pk9, 9, ctx);
        utils.CopyIVsFrom(pa9, pk9);
        utils.CopyEVsFrom(pa9, pk9);

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

        utils.CopyHeldItemFrom(pa9, pk9.HeldItem, pk9.Context, pk9.Version);

        utils.FixMetLocation(pa9, ctx);

        utils.FixPersonalData(pa9, pk9.IsShiny, pk9.Form, pk9.Gender, pk9.Nature, pk9.Ability, false, ctx);

        utils.CopyMovesFrom(pa9, pk9);

        return pa9;
    }

    public PK8 ConvertToPK8(PK9 pk9, ConvertContext ctx)
    {
        var pk8 = new PK8()
        {
            Version = pk9.Version.Generation <= 8 ? pk9.Version : GameVersion.SW,
            MetLocation = pk9.Version.Generation <= 8 ? pk9.MetLocation : (ushort)30001,
            MetDate = pk9.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pk9.MetLevel,
            Ability = pk9.Ability,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),

            HandlingTrainerLanguage = (byte)pk9.Language,

            PokerusState = pk9.PokerusState,
        };

        utils.CopyCommonPropertiesFrom(pk8, pk9, 8, ctx);
        utils.CopyIVsFrom(pk8, pk9);
        utils.CopyEVsFrom(pk8, pk9);

        pk9.CopyContestStatsTo(pk8);

        pk9.CopyRibbonSetCommon3(pk8);
        pk9.CopyRibbonSetEvent3(pk8);
        pk9.CopyRibbonSetCommon4(pk8);
        pk9.CopyRibbonSetEvent4(pk8);
        pk9.CopyRibbonSetCommon6(pk8);
        pk9.CopyRibbonSetMemory6(pk8);
        pk9.CopyRibbonSetCommon7(pk8);

        utils.CopyHeldItemFrom(pk8, pk9.HeldItem, pk9.Context, pk9.Version);

        utils.FixAbility(pk8, ctx);

        utils.FixMetLocation(pk8, ctx);

        utils.FixPersonalData(pk8, pk9.IsShiny, pk9.Form, pk9.Gender, pk9.Nature, pk9.Ability, false, ctx);

        // for Furfrou and Hoopa
        pk8.FormArgumentRemain = pk9.FormArgumentRemain;
        pk8.FormArgumentElapsed = pk9.FormArgumentElapsed;
        pk8.FormArgumentMaximum = pk9.FormArgumentMaximum;

        utils.CopyMovesFrom(pk8, pk9);

        return pk8;
    }

    public PK9 ConvertToPK9(PA9 pa9, ConvertContext ctx)
    {
        var pk9 = new PK9()
        {
            Version = pa9.Version.Context != EntityContext.Gen9a && pa9.Version.Generation <= 9 ? pa9.Version : GameVersion.VL,
            MetLocation = pa9.MetLocation,
            MetDate = pa9.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pa9.MetLevel,
            Ability = pa9.Ability,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),

            HeightScalar = byte.Max(pa9.HeightScalar, 1),
            WeightScalar = byte.Max(pa9.WeightScalar, 1),

            ObedienceLevel = pa9.CurrentLevel,
            TeraTypeOriginal = (MoveType)Tera9RNG.GetTeraTypeFromPersonal(pa9.Species, pa9.Form, 0),
            TeraTypeOverride = (MoveType)Tera9RNG.GetTeraTypeFromPersonal(pa9.Species, pa9.Form, 0),

            PokerusState = pa9.PokerusState,
        };

        utils.CopyCommonPropertiesFrom(pk9, pa9, 9, ctx);
        utils.CopyIVsFrom(pk9, pa9);
        utils.CopyEVsFrom(pk9, pa9);

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

        utils.CopyHeldItemFrom(pk9, pa9.HeldItem, pa9.Context, pa9.Version);

        utils.FixAbility(pk9, ctx);

        utils.FixMetLocation(pk9, ctx);

        utils.FixPersonalData(pk9, pa9.IsShiny, pa9.Form, pa9.Gender, pa9.Nature, pa9.Ability, false, ctx);

        utils.CopyMovesFrom(pk9, pa9);

        return pk9;
    }
}
