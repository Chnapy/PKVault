import type { GameVersion } from "../../../data/sdk/model";
import { theme } from "../../../ui/theme";
import { switchUtil } from "../../../util/switch-util";

export const getGameInfos = (version: GameVersion) => {
  /**
   * Specs from GameVersion.cs & pokeapi.co
   */
  const data =
    switchUtil<
      number,
      Record<
        number,
        () => {
          pokeapiName?: string;
          bgColor?: string;
          text: string;
        }
      >
    >(version, {
      1: () => ({
        pokeapiName: "sapphire",
        bgColor: theme.game.saphir,
        text: "Sapphire",
      }),
      2: () => ({
        pokeapiName: "ruby",
        bgColor: theme.game.ruby,
        text: "Ruby",
      }),
      3: () => ({
        pokeapiName: "emerald",
        bgColor: theme.game.emerald,
        text: "Emerald",
      }),
      4: () => ({
        pokeapiName: "firered",
        bgColor: theme.game.red,
        text: "FireRed",
      }),
      5: () => ({
        pokeapiName: "leafgreen",
        // bgColor: theme.game.,
        text: "LeafGreen",
      }),

      7: () => ({
        pokeapiName: "heartgold",
        bgColor: theme.game.gold,
        text: "HeartGold",
      }),
      8: () => ({
        pokeapiName: "soulsilver",
        bgColor: theme.game.silver,
        text: "SoulSilver",
      }),

      10: () => ({
        pokeapiName: "diamond",
        // bgColor: theme.game.,
        text: "Diamond",
      }),
      11: () => ({
        pokeapiName: "pearl",
        // bgColor: theme.game.,
        text: "Pearl",
      }),
      12: () => ({
        pokeapiName: "platinium",
        // bgColor: theme.game.,
        text: "Platinum",
      }),

      15: () => ({
        pokeapiName: "colosseum",
        // bgColor: theme.game.,
        text: "ColosseumXD",
      }),

      20: () => ({
        pokeapiName: "white",
        // bgColor: theme.game.,
        text: "White",
      }),
      21: () => ({
        pokeapiName: "black",
        // bgColor: theme.game.,
        text: "Black",
      }),
      22: () => ({
        pokeapiName: "white-2",
        // bgColor: theme.game.,
        text: "White2",
      }),
      23: () => ({
        pokeapiName: "black-2",
        // bgColor: theme.game.,
        text: "Black2",
      }),

      24: () => ({
        pokeapiName: "x",
        // bgColor: theme.game.,
        text: "X",
      }),
      25: () => ({
        pokeapiName: "y",
        // bgColor: theme.game.,
        text: "Y",
      }),
      26: () => ({
        pokeapiName: "alpha-sapphire",
        // bgColor: theme.game.,
        text: "Alpha Sapphire",
      }),
      27: () => ({
        pokeapiName: "omega-ruby",
        // bgColor: theme.game.,
        text: "Omega Ruby",
      }),

      30: () => ({
        pokeapiName: "sun",
        // bgColor: theme.game.,
        text: "Sun",
      }),
      31: () => ({
        pokeapiName: "moon",
        // bgColor: theme.game.,
        text: "Moon",
      }),
      32: () => ({
        pokeapiName: "ultra-sun",
        // bgColor: theme.game.,
        text: "UltraSun",
      }),
      33: () => ({
        pokeapiName: "ultra-moon",
        // bgColor: theme.game.,
        text: "UltraMoon",
      }),

      34: () => ({
        // bgColor: theme.game.,
        text: "GO",
      }),

      35: () => ({
        pokeapiName: "red",
        bgColor: theme.game.red,
        text: "Red",
      }),
      36: () => ({
        pokeapiName: "blue",
        bgColor: theme.game.blue,
        text: "Blue",
      }),
      37: () => ({
        pokeapiName: "blue",
        bgColor: theme.game.blue,
        text: "Blue",
      }),
      38: () => ({
        pokeapiName: "yellow",
        bgColor: theme.game.yellow,
        text: "Yellow",
      }),
      39: () => ({
        pokeapiName: "gold",
        bgColor: theme.game.gold,
        text: "Gold",
      }),
      40: () => ({
        pokeapiName: "silver",
        bgColor: theme.game.silver,
        text: "Silver",
      }),
      41: () => ({
        pokeapiName: "crystal",
        bgColor: theme.game.crystal,
        text: "Crystal",
      }),

      42: () => ({
        pokeapiName: "lets-go-pikachu",
        // bgColor: theme.game.,
        text: "Let's Go, Pikachu!",
      }),
      43: () => ({
        pokeapiName: "lets-go-eevee",
        // bgColor: theme.game.,
        text: "Let's Go, Eevee!",
      }),
      44: () => ({
        pokeapiName: "sword",
        // bgColor: theme.game.,
        text: "Sword",
      }),
      45: () => ({
        pokeapiName: "shield",
        // bgColor: theme.game.,
        text: "Shield",
      }),
      47: () => ({
        pokeapiName: "legends-arceus",
        // bgColor: theme.game.,
        text: "Arceus",
      }),
      48: () => ({
        pokeapiName: "brillant-diamond",
        // bgColor: theme.game.,
        text: "Br. Diamond",
      }),
      49: () => ({
        pokeapiName: "brillant-pearl",
        // bgColor: theme.game.,
        text: "Sh. Pearl",
      }),
      50: () => ({
        pokeapiName: "scarlet",
        // bgColor: theme.game.,
        text: "Scarlet",
      }),
      51: () => ({
        pokeapiName: "violet",
        // bgColor: theme.game.,
        text: "Violet",
      }),

      // Game groupings

      52: () => ({
        pokeapiName: "blue",
        bgColor: theme.game.blue,
        text: "RB",
      }),
      53: () => ({
        pokeapiName: "yellow",
        bgColor: theme.game.yellow,
        text: "RBY",
      }),

      54: () => ({
        pokeapiName: "silver",
        bgColor: theme.game.silver,
        text: "GS",
      }),
      55: () => ({
        pokeapiName: "crystal",
        bgColor: theme.game.crystal,
        text: "GSC",
      }),

      56: () => ({
        pokeapiName: "sapphire",
        bgColor: theme.game.saphir,
        text: "RS",
      }),
      57: () => ({
        pokeapiName: "emerald",
        bgColor: theme.game.emerald,
        text: "RSE",
      }),

      58: () => ({
        pokeapiName: "firered",
        bgColor: theme.game.red,
        text: "FRLG",
      }),
      59: () => ({
        // bgColor: theme.game.,
        text: "RSBOX",
      }),
      60: () => ({
        pokeapiName: "colosseum",
        // bgColor: theme.game.,
        text: "COLO",
      }),
      61: () => ({
        pokeapiName: "xd",
        // bgColor: theme.game.,
        text: "XD",
      }),
      62: () => ({
        pokeapiName: "diamond",
        // bgColor: theme.game.,
        text: "DP",
      }),
      63: () => ({
        pokeapiName: "platinum",
        // bgColor: theme.game.,
        text: "DPPt",
      }),
      64: () => ({
        pokeapiName: "heartgold",
        // bgColor: theme.game.,
        text: "HGSS",
      }),
      65: () => ({
        // bgColor: theme.game.,
        text: "BATREV",
      }),
      66: () => ({
        pokeapiName: "black",
        // bgColor: theme.game.,
        text: "BW",
      }),
      67: () => ({
        pokeapiName: "black-2",
        // bgColor: theme.game.,
        text: "B2W2",
      }),
      68: () => ({
        pokeapiName: "x",
        // bgColor: theme.game.,
        text: "XY",
      }),
      69: () => ({
        pokeapiName: "omega-ruby",
        // bgColor: theme.game.,
        text: "ORASDEMO",
      }),
      70: () => ({
        pokeapiName: "omega-ruby",
        // bgColor: theme.game.,
        text: "ORAS",
      }),
      71: () => ({
        pokeapiName: "sun",
        // bgColor: theme.game.,
        text: "SM",
      }),
      72: () => ({
        pokeapiName: "ultra-sun",
        // bgColor: theme.game.,
        text: "USUM",
      }),
      73: () => ({
        // bgColor: theme.game.,
        text: "GG",
      }),
      74: () => ({
        pokeapiName: "sword",
        // bgColor: theme.game.,
        text: "SWSH",
      }),
      75: () => ({
        pokeapiName: "brillant-diamond",
        // bgColor: theme.game.,
        text: "BDSP",
      }),
      76: () => ({
        pokeapiName: "scarlet",
        // bgColor: theme.game.,
        text: "SV",
      }),
      77: () => ({
        pokeapiName: "yellow",
        // bgColor: theme.game.,
        text: "Gen1",
      }),
      78: () => ({
        pokeapiName: "crystal",
        // bgColor: theme.game.,
        text: "Gen2",
      }),
      79: () => ({
        pokeapiName: "emerald",
        // bgColor: theme.game.,
        text: "Gen3",
      }),
      80: () => ({
        pokeapiName: "platinum",
        // bgColor: theme.game.,
        text: "Gen4",
      }),
      81: () => ({
        pokeapiName: "black",
        // bgColor: theme.game.,
        text: "Gen5",
      }),
      82: () => ({
        pokeapiName: "x",
        // bgColor: theme.game.,
        text: "Gen6",
      }),
      83: () => ({
        // bgColor: theme.game.,
        text: "Gen7",
      }),
      84: () => ({
        // bgColor: theme.game.,
        text: "Gen7b",
      }),
      85: () => ({
        // bgColor: theme.game.,
        text: "Gen8",
      }),
      86: () => ({
        // bgColor: theme.game.,
        text: "Gen9",
      }),
      87: () => ({
        // bgColor: theme.game.,
        text: "StadiumJ",
      }),
      88: () => ({
        // bgColor: theme.game.,
        text: "Stadium",
      }),
      89: () => ({
        // bgColor: theme.game.,
        text: "Stadium2",
      }),
      90: () => ({
        // bgColor: theme.game.,
        text: "EFL",
      }),
    }) ??
    (() => {
      throw new Error("Version not handled " + version);
    });

  return data();
};
