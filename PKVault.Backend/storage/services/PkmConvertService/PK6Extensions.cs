
using PKHeX.Core;

public static class PK6Extensions
{
    public static PK7 ConvertToPK7Fixed(this PK6 pk6)
    {
        var pk7 = pk6.ConvertToPK7();

        pk7.FixMetLocation([
            GameVersion.S, GameVersion.R, GameVersion.E, GameVersion.FR, GameVersion.LG, GameVersion.CXD,
            GameVersion.D, GameVersion.P, GameVersion.Pt, GameVersion.SS, GameVersion.HG,
            GameVersion.B, GameVersion.W, GameVersion.B2, GameVersion.W2,
            GameVersion.X, GameVersion.Y, GameVersion.OR, GameVersion.AS,
            GameVersion.SN, GameVersion.MN, GameVersion.US, GameVersion.UM,
        ]);

        return pk7;
    }

    public static PK5 ConvertToPK5(this PK6 pk6)
    {
        return new();
    }
}
