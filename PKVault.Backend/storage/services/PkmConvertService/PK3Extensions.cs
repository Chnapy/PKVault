
using PKHeX.Core;

public static class PK3Extensions
{
    public static PK4 ConvertToPK4Fixed(this PK3 pk3)
    {
        var pk4 = pk3.ConvertToPK4();

        pk4.FixMetLocation([
            GameVersion.S, GameVersion.R, GameVersion.E, GameVersion.FR, GameVersion.LG, GameVersion.CXD,
            GameVersion.D, GameVersion.P, GameVersion.Pt, GameVersion.SS, GameVersion.HG
        ]);

        pk4.OriginalTrainerFriendship = pk3.CurrentFriendship;
        pk4.HandlingTrainerFriendship = pk3.CurrentFriendship;

        return pk4;
    }

    public static XK3 ConvertToXK3Fixed(this PK3 pk3)
    {
        var pk = pk3.ConvertToXK3();

        for (var i = 0; i < pk3.MarkingCount; i++)
        {
            pk.SetMarking(i, pk3.GetMarking(i));
        }

        return pk;
    }

    public static CK3 ConvertToCK3Fixed(this PK3 pk3)
    {
        var pk = pk3.ConvertToCK3();

        for (var i = 0; i < pk3.MarkingCount; i++)
        {
            pk.SetMarking(i, pk3.GetMarking(i));
        }

        return pk;
    }

    public static PK2 ConvertToPK2(this PK3 pk3)
    {
        return new();
    }
}
