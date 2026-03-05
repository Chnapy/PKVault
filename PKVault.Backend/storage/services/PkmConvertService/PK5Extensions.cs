
using PKHeX.Core;

public static class PK5Extensions
{
    public static PK6 ConvertToPK6Fixed(this PK5 pk5, PKMRndValues? rndValues)
    {
        var pk6 = pk5.ConvertToPK6();

        pk6.FixMetLocation([
            GameVersion.S, GameVersion.R, GameVersion.E, GameVersion.FR, GameVersion.LG, GameVersion.CXD,
            GameVersion.D, GameVersion.P, GameVersion.Pt, GameVersion.SS, GameVersion.HG,
            GameVersion.B, GameVersion.W, GameVersion.B2, GameVersion.W2,
            GameVersion.X, GameVersion.Y, GameVersion.OR, GameVersion.AS
        ]);

        pk6.CopyHeldItemFrom(pk5.HeldItem, pk5.Context, pk5.Version);

        if (rndValues == null)
            pk6.FixPID(pk5.IsShiny, pk5.Form, pk5.Gender, pk5.Nature);

        pk6.CopyMovesFrom(pk5);

        pk6.OriginalTrainerFriendship = pk5.CurrentFriendship;
        pk6.HandlingTrainerFriendship = pk5.CurrentFriendship;

        return pk6;
    }

    public static PK4 ConvertToPK4(this PK5 pk5, PKMRndValues? rndValues)
    {
        var pk4 = new PK4()
        {
            Version = GameVersion.D,
            MetLocation = 30001,
            MetDate = pk5.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pk5.MetLevel,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),
        };

        pk4.CopyCommonPropertiesFrom(pk5, 4, rndValues);
        pk4.CopyIVsFrom(pk5);
        pk4.CopyEVsFrom(pk5);

        pk5.CopyContestStatsTo(pk4);

        pk5.CopyRibbonSetCommon3(pk4);
        pk5.CopyRibbonSetEvent3(pk4);
        pk5.CopyRibbonSetCommon4(pk4);
        pk5.CopyRibbonSetEvent4(pk4);

        pk4.CopyHeldItemFrom(pk5.HeldItem, pk5.Context, pk5.Version);

        pk4.FixAbility();

        pk4.FixMetLocation([GameVersion.D, GameVersion.P, GameVersion.Pt, GameVersion.HG, GameVersion.SS]);

        if (rndValues == null)
            pk4.FixPID(pk5.IsShiny, pk5.Form, pk5.Gender, pk5.Nature);

        pk4.CopyMovesFrom(pk5);

        return pk4;
    }
}
