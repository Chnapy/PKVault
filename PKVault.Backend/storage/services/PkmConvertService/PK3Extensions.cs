
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

        return pk4;
    }

    public static PK2 ConvertToPK2(this PK3 pk3)
    {
        return new();
    }
}
