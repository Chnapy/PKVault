
using PKHeX.Core;

public class PK6Converter(PKMConverterUtils utils)
{
    public PK7 ConvertToPK7Fixed(PK6 pk6, PKMRndValues? rndValues)
    {
        var pk7 = pk6.ConvertToPK7();

        utils.FixMetLocation(pk7, [
            GameVersion.S, GameVersion.R, GameVersion.E, GameVersion.FR, GameVersion.LG, GameVersion.CXD,
            GameVersion.D, GameVersion.P, GameVersion.Pt, GameVersion.SS, GameVersion.HG,
            GameVersion.B, GameVersion.W, GameVersion.B2, GameVersion.W2,
            GameVersion.X, GameVersion.Y, GameVersion.OR, GameVersion.AS,
            GameVersion.SN, GameVersion.MN, GameVersion.US, GameVersion.UM,
        ]);

        if (rndValues == null)
            utils.FixPID(pk7, pk6.IsShiny, pk6.Form, pk6.Gender, pk6.Nature);

        utils.CopyMovesFrom(pk7, pk6);

        return pk7;
    }

    public PK5 ConvertToPK5(PK6 pk6, PKMRndValues? rndValues)
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

        utils.CopyCommonPropertiesFrom(pk5, pk6, 5, rndValues);
        utils.CopyIVsFrom(pk5, pk6);
        utils.CopyEVsFrom(pk5, pk6);

        pk6.CopyContestStatsTo(pk5);

        pk6.CopyRibbonSetCommon3(pk5);
        pk6.CopyRibbonSetEvent3(pk5);
        pk6.CopyRibbonSetCommon4(pk5);
        pk6.CopyRibbonSetEvent4(pk5);

        utils.CopyHeldItemFrom(pk5, pk6.HeldItem, pk6.Context, pk6.Version);

        utils.FixAbility(pk5);

        utils.FixMetLocation(pk5, [GameVersion.B, GameVersion.W, GameVersion.B2, GameVersion.W2]);

        if (rndValues == null)
            utils.FixPID(pk5, pk6.IsShiny, pk6.Form, pk6.Gender, pk6.Nature);

        utils.CopyMovesFrom(pk5, pk6);

        return pk5;
    }
}
