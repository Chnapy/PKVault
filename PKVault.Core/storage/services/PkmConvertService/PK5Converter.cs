
using PKHeX.Core;

namespace PKVault.Core;

public class PK5Converter(PKMConverterUtils utils)
{
    public PK6 ConvertToPK6Fixed(PK5 pk5, ConvertContext? ctx)
    {
        var pk6 = pk5.ConvertToPK6();

        utils.FixMetLocation(pk6, ctx);

        utils.CopyHeldItemFrom(pk6, pk5.HeldItem, pk5.Context, pk5.Version);

        if (ctx == null)
            utils.FixPID(pk6, pk5.IsShiny, pk5.Form, pk5.Gender, pk5.Nature, pk5.Ability);

        utils.CopyMovesFrom(pk6, pk5);

        pk6.OriginalTrainerFriendship = pk5.CurrentFriendship;
        pk6.HandlingTrainerFriendship = pk5.CurrentFriendship;

        return pk6;
    }

    public PK4 ConvertToPK4(PK5 pk5, ConvertContext? ctx)
    {
        var pk4 = new PK4()
        {
            Version = pk5.Version.Generation <= 4 ? pk5.Version : GameVersion.D,
            MetLocation = pk5.Version.Generation <= 3
                ? Locations.Transfer3
                : pk5.Version.Generation == 4 ? pk5.MetLocation : (ushort)30001,
            MetDate = pk5.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pk5.MetLevel,
            Ability = pk5.Ability,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),

            PokerusState = pk5.PokerusState,
        };

        utils.CopyCommonPropertiesFrom(pk4, pk5, 4, ctx);
        utils.CopyIVsFrom(pk4, pk5);
        utils.CopyEVsFrom(pk4, pk5);

        pk5.CopyContestStatsTo(pk4);

        pk5.CopyRibbonSetCommon3(pk4);
        pk5.CopyRibbonSetEvent3(pk4);
        pk5.CopyRibbonSetCommon4(pk4);
        pk5.CopyRibbonSetEvent4(pk4);

        utils.CopyHeldItemFrom(pk4, pk5.HeldItem, pk5.Context, pk5.Version);

        utils.FixAbility(pk4, ctx);

        utils.FixMetLocation(pk4, ctx);

        if (ctx == null)
            utils.FixPID(pk4, pk5.IsShiny, pk5.Form, pk5.Gender, pk5.Nature, pk5.Ability);

        utils.CopyMovesFrom(pk4, pk5);

        return pk4;
    }
}
