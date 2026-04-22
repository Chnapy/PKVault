
using PKHeX.Core;

public class PK4Converter(PKMConverterUtils utils)
{
    public PK5 ConvertToPK5Fixed(PK4 pk4, PKMRndValues? rndValues)
    {
        var pk5 = pk4.ConvertToPK5();

        utils.FixMetLocation(pk5, [
            GameVersion.S, GameVersion.R, GameVersion.E, GameVersion.FR, GameVersion.LG, GameVersion.CXD,
            GameVersion.D, GameVersion.P, GameVersion.Pt, GameVersion.SS, GameVersion.HG,
            GameVersion.B, GameVersion.W, GameVersion.B2, GameVersion.W2
        ]);

        if (rndValues == null)
            utils.FixPID(pk5, pk4.IsShiny, pk4.Form, pk4.Gender, pk4.Nature);

        pk5.OriginalTrainerFriendship = pk4.CurrentFriendship;
        pk5.HandlingTrainerFriendship = pk4.CurrentFriendship;

        utils.CopyMovesFrom(pk5, pk4);

        return pk5;
    }

    public BK4 ConvertToBK4Fixed(PK4 pk4, PKMRndValues? rndValues)
    {
        var bk4 = pk4.ConvertToBK4();

        for (var i = 0; i < pk4.MarkingCount; i++)
        {
            bk4.SetMarking(i, pk4.GetMarking(i));
        }

        if (rndValues == null)
            utils.FixPID(bk4, pk4.IsShiny, pk4.Form, pk4.Gender, pk4.Nature);

        utils.CopyMovesFrom(bk4, pk4);

        return bk4;
    }

    public RK4 ConvertToRK4Fixed(PK4 pk4, PKMRndValues? rndValues)
    {
        var rk4 = pk4.ConvertToRK4();

        for (var i = 0; i < pk4.MarkingCount; i++)
        {
            rk4.SetMarking(i, pk4.GetMarking(i));
        }

        if (rndValues == null)
            utils.FixPID(rk4, pk4.IsShiny, pk4.Form, pk4.Gender, pk4.Nature);

        utils.CopyMovesFrom(rk4, pk4);

        return rk4;
    }

    public PK3 ConvertToPK3(PK4 pk4, PKMRndValues? rndValues)
    {
        var pk3 = new PK3()
        {
            Version = GameVersion.S,
            MetLocation = 30001,
            MetDate = pk4.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pk4.MetLevel,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),

            PokerusState = pk4.PokerusState,
        };

        utils.CopyCommonPropertiesFrom(pk3, pk4, 3, rndValues);
        utils.CopyIVsFrom(pk3, pk4);
        utils.CopyEVsFrom(pk3, pk4);

        pk4.CopyContestStatsTo(pk3);

        pk4.CopyRibbonSetCommon3(pk3);
        pk4.CopyRibbonSetEvent3(pk3);

        utils.CopyHeldItemFrom(pk3, pk4.HeldItem, pk4.Context, pk4.Version);

        utils.FixAbility(pk3);

        utils.FixMetLocation(pk3, [GameVersion.S, GameVersion.R, GameVersion.E, GameVersion.FR, GameVersion.LG, GameVersion.CXD]);

        if (rndValues == null)
            utils.FixPID(pk3, pk4.IsShiny, pk4.Form, pk4.Gender, pk4.Nature);

        utils.CopyMovesFrom(pk3, pk4);

        return pk3;
    }
}
