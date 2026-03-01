
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

        return pk5;
    }

    public static PK3 ConvertToPK3(this PK4 pk4)
    {
        return new();
    }
}
