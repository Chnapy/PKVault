using PKHeX.Core;

namespace PKVault.Core;

/**
 * PKHeX has no Copy* helper for the Gen 3-only ribbon sets, unlike the rest.
 */
internal static class MissingRibbonSetExtensions
{
    public static void CopyRibbonSetOnly3(this IRibbonSetOnly3 set, IRibbonSetOnly3 dest)
    {
        dest.RibbonCountG3Cool = set.RibbonCountG3Cool;
        dest.RibbonCountG3Beauty = set.RibbonCountG3Beauty;
        dest.RibbonCountG3Cute = set.RibbonCountG3Cute;
        dest.RibbonCountG3Smart = set.RibbonCountG3Smart;
        dest.RibbonCountG3Tough = set.RibbonCountG3Tough;
        dest.RibbonWorld = set.RibbonWorld;
    }

    public static void CopyRibbonSetUnique3(this IRibbonSetUnique3 set, IRibbonSetUnique3 dest)
    {
        dest.RibbonWinning = set.RibbonWinning;
        dest.RibbonVictory = set.RibbonVictory;
    }

    public static void CopyRibbonSetUnique4(this IRibbonSetUnique4 set, IRibbonSetUnique4 dest)
    {
        dest.RibbonAbility = set.RibbonAbility;
        dest.RibbonAbilityGreat = set.RibbonAbilityGreat;
        dest.RibbonAbilityDouble = set.RibbonAbilityDouble;
        dest.RibbonAbilityMulti = set.RibbonAbilityMulti;
        dest.RibbonAbilityPair = set.RibbonAbilityPair;
        dest.RibbonAbilityWorld = set.RibbonAbilityWorld;

        dest.RibbonG3Cool = set.RibbonG3Cool;
        dest.RibbonG3CoolSuper = set.RibbonG3CoolSuper;
        dest.RibbonG3CoolHyper = set.RibbonG3CoolHyper;
        dest.RibbonG3CoolMaster = set.RibbonG3CoolMaster;
        dest.RibbonG3Beauty = set.RibbonG3Beauty;
        dest.RibbonG3BeautySuper = set.RibbonG3BeautySuper;
        dest.RibbonG3BeautyHyper = set.RibbonG3BeautyHyper;
        dest.RibbonG3BeautyMaster = set.RibbonG3BeautyMaster;
        dest.RibbonG3Cute = set.RibbonG3Cute;
        dest.RibbonG3CuteSuper = set.RibbonG3CuteSuper;
        dest.RibbonG3CuteHyper = set.RibbonG3CuteHyper;
        dest.RibbonG3CuteMaster = set.RibbonG3CuteMaster;
        dest.RibbonG3Smart = set.RibbonG3Smart;
        dest.RibbonG3SmartSuper = set.RibbonG3SmartSuper;
        dest.RibbonG3SmartHyper = set.RibbonG3SmartHyper;
        dest.RibbonG3SmartMaster = set.RibbonG3SmartMaster;
        dest.RibbonG3Tough = set.RibbonG3Tough;
        dest.RibbonG3ToughSuper = set.RibbonG3ToughSuper;
        dest.RibbonG3ToughHyper = set.RibbonG3ToughHyper;
        dest.RibbonG3ToughMaster = set.RibbonG3ToughMaster;

        dest.RibbonG4Cool = set.RibbonG4Cool;
        dest.RibbonG4CoolGreat = set.RibbonG4CoolGreat;
        dest.RibbonG4CoolUltra = set.RibbonG4CoolUltra;
        dest.RibbonG4CoolMaster = set.RibbonG4CoolMaster;
        dest.RibbonG4Beauty = set.RibbonG4Beauty;
        dest.RibbonG4BeautyGreat = set.RibbonG4BeautyGreat;
        dest.RibbonG4BeautyUltra = set.RibbonG4BeautyUltra;
        dest.RibbonG4BeautyMaster = set.RibbonG4BeautyMaster;
        dest.RibbonG4Cute = set.RibbonG4Cute;
        dest.RibbonG4CuteGreat = set.RibbonG4CuteGreat;
        dest.RibbonG4CuteUltra = set.RibbonG4CuteUltra;
        dest.RibbonG4CuteMaster = set.RibbonG4CuteMaster;
        dest.RibbonG4Smart = set.RibbonG4Smart;
        dest.RibbonG4SmartGreat = set.RibbonG4SmartGreat;
        dest.RibbonG4SmartUltra = set.RibbonG4SmartUltra;
        dest.RibbonG4SmartMaster = set.RibbonG4SmartMaster;
        dest.RibbonG4Tough = set.RibbonG4Tough;
        dest.RibbonG4ToughGreat = set.RibbonG4ToughGreat;
        dest.RibbonG4ToughUltra = set.RibbonG4ToughUltra;
        dest.RibbonG4ToughMaster = set.RibbonG4ToughMaster;
    }
}
