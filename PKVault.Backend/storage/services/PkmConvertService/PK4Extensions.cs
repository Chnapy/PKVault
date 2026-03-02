
using PKHeX.Core;

public static class PK4Extensions
{
    public static PK5 ConvertToPK5Fixed(this PK4 pk4)
    {
        var pk5 = pk4.ConvertToPK5();

        pk5.FixMetLocation([
            GameVersion.S, GameVersion.R, GameVersion.E, GameVersion.FR, GameVersion.LG, GameVersion.CXD,
            GameVersion.D, GameVersion.P, GameVersion.Pt, GameVersion.SS, GameVersion.HG,
            GameVersion.B, GameVersion.W, GameVersion.B2, GameVersion.W2
        ]);

        pk5.OriginalTrainerFriendship = pk4.CurrentFriendship;
        pk5.HandlingTrainerFriendship = pk4.CurrentFriendship;

        return pk5;
    }

    public static BK4 ConvertToBK4Fixed(this PK4 pk4)
    {
        var bk4 = pk4.ConvertToBK4();

        for (var i = 0; i < pk4.MarkingCount; i++)
        {
            bk4.SetMarking(i, pk4.GetMarking(i));
        }

        return bk4;
    }

    public static RK4 ConvertToRK4Fixed(this PK4 pk4)
    {
        var rk4 = pk4.ConvertToRK4();

        for (var i = 0; i < pk4.MarkingCount; i++)
        {
            rk4.SetMarking(i, pk4.GetMarking(i));
        }

        return rk4;
    }

    public static PK3 ConvertToPK3(this PK4 pk4)
    {
        return new();
    }
}
