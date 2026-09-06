
using PKHeX.Core;
using PokeApi.Models;

public class VersionGroupToVersion
{
    public static GameVersion? GetVersion(NamedApiResource? group) => group?.Name switch
    {
        null => null,
        "red-blue" => GameVersion.RB,
        "yellow" => GameVersion.Y,
        "gold-silver" => GameVersion.GS,
        "crystal" => GameVersion.C,
        "ruby-sapphire" => GameVersion.RS,
        "emerald" => GameVersion.E,
        "firered-leafgreen" => GameVersion.FRLG,
        "diamond-pearl" => GameVersion.DP,
        "platinum" => GameVersion.Pt,
        "heartgold-soulsilver" => GameVersion.HGSS,
        "black-white" => GameVersion.BW,
        "colosseum" => GameVersion.COLO,
        "xd" => GameVersion.XD,
        "black-2-white-2" => GameVersion.B2W2,
        "x-y" => GameVersion.XY,
        "omega-ruby-alpha-sapphire" => GameVersion.ORAS,
        "sun-moon" => GameVersion.SM,
        "ultra-sun-ultra-moon" => GameVersion.USUM,
        "lets-go-pikachu-lets-go-eevee" => GameVersion.GG,
        "sword-shield" => GameVersion.SWSH,
        "the-isle-of-armor" => GameVersion.SWSH,
        "the-crown-tundra" => GameVersion.SWSH,
        "brilliant-diamond-shining-pearl" => GameVersion.BDSP,
        "legends-arceus" => GameVersion.PLA,
        "scarlet-violet" => GameVersion.SV,
        "the-teal-mask" => GameVersion.SV,
        "the-indigo-disk" => GameVersion.SV,
        "red-green-japan" => GameVersion.GN,
        "blue-japan" => GameVersion.BU,
        "legends-za" => GameVersion.ZA,
        "mega-dimension" => GameVersion.ZA,
        "champions" => GameVersion.CP,
        _ => throw new Exception($"VersionGroup not handled: {group.Name}"),
    };
}
