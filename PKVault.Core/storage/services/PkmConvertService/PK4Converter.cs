
using PKHeX.Core;

namespace PKVault.Core;

public class PK4Converter(PKMConverterUtils utils)
{
    public PK5 ConvertToPK5Fixed(PK4 pk4, ConvertContext ctx)
    {
        var pk5 = pk4.ConvertToPK5();
        if (ctx.TargetPkm != null)
            pk5.PID = ctx.TargetPkm.PID;

        utils.FixMetLocation(pk5, ctx);

        utils.FixPersonalData(pk5, pk4.IsShiny, pk4.Form, pk4.Gender, pk4.Nature, pk4.Ability, false, ctx);

        pk5.OriginalTrainerFriendship = pk4.CurrentFriendship;
        pk5.HandlingTrainerFriendship = pk4.CurrentFriendship;

        utils.CopyMovesFrom(pk5, pk4);

        return pk5;
    }

    public BK4 ConvertToBK4Fixed(PK4 pk4, ConvertContext ctx)
    {
        var bk4 = pk4.ConvertToBK4();

        for (var i = 0; i < pk4.MarkingCount; i++)
        {
            bk4.SetMarking(i, pk4.GetMarking(i));
        }

        utils.FixPersonalData(bk4, pk4.IsShiny, pk4.Form, pk4.Gender, pk4.Nature, pk4.Ability, false, ctx);

        utils.CopyMovesFrom(bk4, pk4);

        return bk4;
    }

    public RK4 ConvertToRK4Fixed(PK4 pk4, ConvertContext ctx)
    {
        var rk4 = pk4.ConvertToRK4();

        for (var i = 0; i < pk4.MarkingCount; i++)
        {
            rk4.SetMarking(i, pk4.GetMarking(i));
        }

        utils.FixPersonalData(rk4, pk4.IsShiny, pk4.Form, pk4.Gender, pk4.Nature, pk4.Ability, false, ctx);

        utils.CopyMovesFrom(rk4, pk4);

        return rk4;
    }

    public PK3 ConvertToPK3(PK4 pk4, ConvertContext ctx)
    {
        var pk3 = new PK3()
        {
            Version = pk4.Version.Generation <= 3 ? pk4.Version : GameVersion.E,
            MetLocation = pk4.Version.Generation <= 3 ? pk4.MetLocation : (ushort)30001,
            MetDate = pk4.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pk4.MetLevel,
            Ability = pk4.Ability,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),

            PokerusState = pk4.PokerusState,
        };

        utils.CopyCommonPropertiesFrom(pk3, pk4, 3, ctx);
        utils.CopyIVsFrom(pk3, pk4);
        utils.CopyEVsFrom(pk3, pk4);

        pk4.CopyContestStatsTo(pk3);

        pk4.CopyRibbonSetCommon3(pk3);
        pk4.CopyRibbonSetEvent3(pk3);

        utils.CopyHeldItemFrom(pk3, pk4.HeldItem, pk4.Context, pk4.Version);

        utils.FixAbility(pk3, ctx);

        utils.FixMetLocation(pk3, ctx);

        utils.FixPersonalData(pk3, pk4.IsShiny, pk4.Form, pk4.Gender, pk4.Nature, pk4.Ability, false, ctx);

        utils.CopyMovesFrom(pk3, pk4);

        return pk3;
    }
}
