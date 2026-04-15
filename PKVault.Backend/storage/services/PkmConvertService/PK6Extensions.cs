
using PKHeX.Core;

public static class PK6Extensions
{
    public static PK7 ConvertToPK7Fixed(this PK6 pk6, PKMRndValues? rndValues)
    {
        var pk7 = pk6.ConvertToPK7();

        pk7.FixMetLocation([
            GameVersion.S, GameVersion.R, GameVersion.E, GameVersion.FR, GameVersion.LG, GameVersion.CXD,
            GameVersion.D, GameVersion.P, GameVersion.Pt, GameVersion.SS, GameVersion.HG,
            GameVersion.B, GameVersion.W, GameVersion.B2, GameVersion.W2,
            GameVersion.X, GameVersion.Y, GameVersion.OR, GameVersion.AS,
            GameVersion.SN, GameVersion.MN, GameVersion.US, GameVersion.UM,
        ]);

        if (rndValues == null)
            pk7.FixPID(pk6.IsShiny, pk6.Form, pk6.Gender, pk6.Nature);

        pk7.CopyMovesFrom(pk6);

        return pk7;
    }

    public static PK5 ConvertToPK5(this PK6 pk6, PKMRndValues? rndValues)
    {
        var pk5 = new PK5()
        {
            Version = GameVersion.B,
            MetLocation = 30001,
            MetDate = pk6.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pk6.MetLevel,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),

            PokerusState = pk6.PokerusState,
        };

        pk5.CopyCommonPropertiesFrom(pk6, 5, rndValues);
        pk5.CopyIVsFrom(pk6);
        pk5.CopyEVsFrom(pk6);

        pk6.CopyContestStatsTo(pk5);

        pk6.CopyRibbonSetCommon3(pk5);
        pk6.CopyRibbonSetEvent3(pk5);
        pk6.CopyRibbonSetCommon4(pk5);
        pk6.CopyRibbonSetEvent4(pk5);

        pk5.CopyHeldItemFrom(pk6.HeldItem, pk6.Context, pk6.Version);

        pk5.FixAbility();

        pk5.FixMetLocation([GameVersion.B, GameVersion.W, GameVersion.B2, GameVersion.W2]);

        if (rndValues == null)
            pk5.FixPID(pk6.IsShiny, pk6.Form, pk6.Gender, pk6.Nature);

        pk5.CopyMovesFrom(pk6);

        return pk5;
    }
}
