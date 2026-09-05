using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using PKHeX.Core;

namespace PKVault.Core;

public partial class PokeApiFromPKHeX
{
    public static string GetPokeapiItemName(string pkhexItemName)
    {
        var pokeapiName = PokeApiNameFromPKHexName(pkhexItemName);

        /**
         * Missing ZA items from pokeapi (may be auto-added later):
         * - 1592 galarica-wreath -> 1643 no-sprite
         * - 1582 galarica-cuff -> 1633 no-sprite
         * - 2570 excadrite
         * - 2560 victreebelite
         * - 2564 feraligite
         * - 2584 zygardite
         * - 2579 floettite
         * - 2569 emboarite
         *
         * Missing Stadium items from pokeapi:
         * - 128 gorgeous-box
         */
        return pokeapiName switch
        {
            "leek" => "stick",
            "upgrade" => "up-grade",
            "strange-ball" => "lastrange-ball",
            "feather-ball" => "lafeather-ball",
            "wing-ball" => "lawing-ball",
            "jet-ball" => "lajet-ball",
            "leaden-ball" => "laleaden-ball",
            "gigaton-ball" => "lagigaton-ball",
            "origin-ball" => "laorigin-ball",
            var _ when pokeapiName.EndsWith("-feather") => $"{pokeapiName[..^8]}-wing",
            var _ when pokeapiName.EndsWith("ium-z") => $"{pokeapiName}--held",
            var _ when pokeapiName.EndsWith("ium-z-[z]") => $"{pokeapiName[..^4]}--bag",
            var _ when pokeapiName.EndsWith("-(la)") => $"la{pokeapiName[..^5]}",
            _ => pokeapiName
        };
    }

    public static int GetBallPokeApiId(Ball ball) => ball switch
    {
        Ball.None => 0,
        Ball.Master => 1,
        Ball.Ultra => 2,
        Ball.Great => 3,
        Ball.Poke => 4,
        Ball.Safari => 5,
        Ball.Net => 6,
        Ball.Dive => 7,
        Ball.Nest => 8,
        Ball.Repeat => 9,
        Ball.Timer => 10,
        Ball.Luxury => 11,
        Ball.Premier => 12,
        Ball.Dusk => 13,
        Ball.Heal => 14,
        Ball.Quick => 15,
        Ball.Cherish => 16,
        Ball.Fast => 492,
        Ball.Level => 493,
        Ball.Lure => 494,
        Ball.Heavy => 495,
        Ball.Love => 496,
        Ball.Friend => 497,
        Ball.Moon => 498,
        Ball.Sport => 499,
        Ball.Dream => 576,
        Ball.Beast => 851,
        Ball.Strange => 1785,
        Ball.LAPoke => 1710,
        Ball.LAGreat => 1711,
        Ball.LAUltra => 1712,
        Ball.LAFeather => 1713,
        Ball.LAWing => 1746,
        Ball.LAJet => 1747,
        Ball.LAHeavy => 1748,
        Ball.LALeaden => 1749,
        Ball.LAGigaton => 1750,
        Ball.LAOrigin => 1771,
        _ => 0,
    };

    private static string PokeApiNameFromPKHexName(string pkhexName)
    {
        static string RemoveDiacritics(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
                return text;

            var normalizedString = text.Normalize(NormalizationForm.FormD);
            var stringBuilder = new StringBuilder();

            foreach (var c in normalizedString)
            {
                var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
                if (unicodeCategory != UnicodeCategory.NonSpacingMark)
                    stringBuilder.Append(c);
            }

            return stringBuilder.ToString().Normalize(NormalizationForm.FormC);
        }

        // if (pkhexName.Contains('('))
        // {
        //     return pkhexName;
        // }

        var result = PascalCaseRegex().Replace(pkhexName, "$1-$2");
        result = SpaceRegex().Replace(result, "-").ToLower();
        result = RemoveDiacritics(result);
        result = result.Replace("♀", "-f").Replace("♂", "-m");
        result = PonctuRegex().Replace(result, "");

        return result;
    }

    [GeneratedRegex("([a-z])([A-Z])")]
    private static partial Regex PascalCaseRegex();

    [GeneratedRegex(@"\s+")]
    private static partial Regex SpaceRegex();

    [GeneratedRegex(@"[\.’'`´]+")]
    private static partial Regex PonctuRegex();
}
