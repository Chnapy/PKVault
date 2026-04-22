
using PKHeX.Core;

public class PK5Converter(PKMConverterUtils utils)
{
    public PK6 ConvertToPK6Fixed(PK5 pk5, PKMRndValues? rndValues)
    {
        var pk6 = pk5.ConvertToPK6();

        utils.FixMetLocation(pk6, [
            GameVersion.S, GameVersion.R, GameVersion.E, GameVersion.FR, GameVersion.LG, GameVersion.CXD,
            GameVersion.D, GameVersion.P, GameVersion.Pt, GameVersion.SS, GameVersion.HG,
            GameVersion.B, GameVersion.W, GameVersion.B2, GameVersion.W2,
            GameVersion.X, GameVersion.Y, GameVersion.OR, GameVersion.AS
        ]);

        utils.CopyHeldItemFrom(pk6, pk5.HeldItem, pk5.Context, pk5.Version);

        if (rndValues == null)
            utils.FixPID(pk6, pk5.IsShiny, pk5.Form, pk5.Gender, pk5.Nature);

        utils.CopyMovesFrom(pk6, pk5);

        pk6.OriginalTrainerFriendship = pk5.CurrentFriendship;
        pk6.HandlingTrainerFriendship = pk5.CurrentFriendship;

        return pk6;
    }

    public PK4 ConvertToPK4(PK5 pk5, PKMRndValues? rndValues)
    {
        var pk4 = new PK4()
        {
            Version = GameVersion.D,
            MetLocation = 30001,
            MetDate = pk5.MetDate ?? EncounterDate.GetDateSwitch(),
            MetLevel = pk5.MetLevel,

            // EggLocation = Locations.LinkTrade6,
            // EggMetDate = pk7.MetDate ?? EncounterDate.GetDateSwitch(),

            PokerusState = pk5.PokerusState,
        };

        utils.CopyCommonPropertiesFrom(pk4, pk5, 4, rndValues);
        utils.CopyIVsFrom(pk4, pk5);
        utils.CopyEVsFrom(pk4, pk5);

        pk5.CopyContestStatsTo(pk4);

        pk5.CopyRibbonSetCommon3(pk4);
        pk5.CopyRibbonSetEvent3(pk4);
        pk5.CopyRibbonSetCommon4(pk4);
        pk5.CopyRibbonSetEvent4(pk4);

        utils.CopyHeldItemFrom(pk4, pk5.HeldItem, pk5.Context, pk5.Version);

        utils.FixAbility(pk4);

        utils.FixMetLocation(pk4, [GameVersion.D, GameVersion.P, GameVersion.Pt, GameVersion.HG, GameVersion.SS]);

        if (rndValues == null)
            utils.FixPID(pk4, pk5.IsShiny, pk5.Form, pk5.Gender, pk5.Nature);

        utils.CopyMovesFrom(pk4, pk5);

        return pk4;
    }
}
