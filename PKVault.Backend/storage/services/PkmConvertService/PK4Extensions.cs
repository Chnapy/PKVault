
using PKHeX.Core;

public static class PK4Extensions
{
    public static PK5 ConvertToPK5Fixed(this PK4 pk4, PKMRndValues? rndValues)
    {
        var pk5 = pk4.ConvertToPK5();

        pk5.FixMetLocation([
            GameVersion.S, GameVersion.R, GameVersion.E, GameVersion.FR, GameVersion.LG, GameVersion.CXD,
            GameVersion.D, GameVersion.P, GameVersion.Pt, GameVersion.SS, GameVersion.HG,
            GameVersion.B, GameVersion.W, GameVersion.B2, GameVersion.W2
        ]);

        if (rndValues == null)
            pk5.FixPID(pk4.IsShiny, pk4.Form, pk4.Gender, pk4.Nature);

        pk5.OriginalTrainerFriendship = pk4.CurrentFriendship;
        pk5.HandlingTrainerFriendship = pk4.CurrentFriendship;

        pk5.CopyMovesFrom(pk4);

        return pk5;
    }

    public static BK4 ConvertToBK4Fixed(this PK4 pk4, PKMRndValues? rndValues)
    {
        var bk4 = pk4.ConvertToBK4();

        for (var i = 0; i < pk4.MarkingCount; i++)
        {
            bk4.SetMarking(i, pk4.GetMarking(i));
        }

        if (rndValues == null)
            bk4.FixPID(pk4.IsShiny, pk4.Form, pk4.Gender, pk4.Nature);

        bk4.CopyMovesFrom(pk4);

        return bk4;
    }

    public static RK4 ConvertToRK4Fixed(this PK4 pk4, PKMRndValues? rndValues)
    {
        var rk4 = pk4.ConvertToRK4();

        for (var i = 0; i < pk4.MarkingCount; i++)
        {
            rk4.SetMarking(i, pk4.GetMarking(i));
        }

        if (rndValues == null)
            rk4.FixPID(pk4.IsShiny, pk4.Form, pk4.Gender, pk4.Nature);

        rk4.CopyMovesFrom(pk4);

        return rk4;
    }

    public static PK3 ConvertToPK3(this PK4 pk4, PKMRndValues? rndValues)
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

        pk3.CopyCommonPropertiesFrom(pk4, 3, rndValues);
        pk3.CopyIVsFrom(pk4);
        pk3.CopyEVsFrom(pk4);

        pk4.CopyContestStatsTo(pk3);

        pk4.CopyRibbonSetCommon3(pk3);
        pk4.CopyRibbonSetEvent3(pk3);

        pk3.CopyHeldItemFrom(pk4.HeldItem, pk4.Context, pk4.Version);

        pk3.FixAbility();

        pk3.FixMetLocation([GameVersion.S, GameVersion.R, GameVersion.E, GameVersion.FR, GameVersion.LG, GameVersion.CXD]);

        if (rndValues == null)
            pk3.FixPID(pk4.IsShiny, pk4.Form, pk4.Gender, pk4.Nature);

        pk3.CopyMovesFrom(pk4);

        return pk3;
    }
}
