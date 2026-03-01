
using PKHeX.Core;

public static class PK5Extensions
{
    public static PK6 ConvertToPK6Fixed(this PK5 pk5)
    {
        var pk6 = pk5.ConvertToPK6();

        pk6.FixMetLocation([
            GameVersion.S, GameVersion.R, GameVersion.E, GameVersion.FR, GameVersion.LG, GameVersion.CXD,
            GameVersion.D, GameVersion.P, GameVersion.Pt, GameVersion.SS, GameVersion.HG,
            GameVersion.B, GameVersion.W, GameVersion.B2, GameVersion.W2,
            GameVersion.X, GameVersion.Y, GameVersion.OR, GameVersion.AS
        ]);

        return pk6;
    }

    public static PK4 ConvertToPK4(this PK5 pk5)
    {
        return new();
    }
}
