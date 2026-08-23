using PKHeX.Core;

/// <summary>
/// Maps a PKHeX <see cref="GameVersion"/> to a stable, human-readable folder
/// name used to organize uploaded save files by game.
/// </summary>
public static class GameVersionNameUtil
{
    /// <summary>
    /// Returns a readable game name (English, filesystem-safe). Falls back to
    /// the raw <see cref="GameVersion"/> identifier for unmapped values.
    /// </summary>
    public static string GetGameName(GameVersion version)
    {
        var name = version switch
        {
            GameVersion.RD => "Red",
            GameVersion.BU => "Blue",
            GameVersion.GN => "Green",
            GameVersion.YW => "Yellow",
            GameVersion.GD => "Gold",
            GameVersion.SI => "Silver",
            GameVersion.C => "Crystal",
            GameVersion.R => "Ruby",
            GameVersion.S => "Sapphire",
            GameVersion.E => "Emerald",
            GameVersion.FR => "FireRed",
            GameVersion.LG => "LeafGreen",
            GameVersion.CXD => "ColosseumXD",
            GameVersion.D => "Diamond",
            GameVersion.P => "Pearl",
            GameVersion.Pt => "Platinum",
            GameVersion.HG => "HeartGold",
            GameVersion.SS => "SoulSilver",
            GameVersion.B => "Black",
            GameVersion.W => "White",
            GameVersion.B2 => "Black2",
            GameVersion.W2 => "White2",
            GameVersion.X => "X",
            GameVersion.Y => "Y",
            GameVersion.OR => "OmegaRuby",
            GameVersion.AS => "AlphaSapphire",
            GameVersion.SN => "Sun",
            GameVersion.MN => "Moon",
            GameVersion.US => "UltraSun",
            GameVersion.UM => "UltraMoon",
            GameVersion.GP => "LetsGoPikachu",
            GameVersion.GE => "LetsGoEevee",
            GameVersion.SW => "Sword",
            GameVersion.SH => "Shield",
            GameVersion.BD => "BrilliantDiamond",
            GameVersion.SP => "ShiningPearl",
            GameVersion.PLA => "LegendsArceus",
            GameVersion.SL => "Scarlet",
            GameVersion.VL => "Violet",
            _ => version.ToString(),
        };

        return SanitizeName(name);
    }

    /// <summary>
    /// Returns the destination sub-path used to store an uploaded save,
    /// grouped by generation then game, e.g. "Gen3/Emerald".
    /// </summary>
    public static string GetGameFolder(GameVersion version, int generation)
    {
        var gen = generation > 0 ? $"Gen{generation}" : "GenUnknown";
        return Path.Combine(gen, GetGameName(version));
    }

    private static string SanitizeName(string name)
    {
        var invalid = Path.GetInvalidFileNameChars();
        var cleaned = new string([.. name.Where(c => !invalid.Contains(c))]).Trim();
        return string.IsNullOrEmpty(cleaned) ? "Unknown" : cleaned;
    }
}
