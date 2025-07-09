import type React from "react";
import type { GameVersion } from "../../data/sdk/model";
import { Button, type ButtonProps } from "../../ui/button/button";
import { theme } from "../../ui/theme";
import { switchUtil } from "../../util/switch-util";

export const GameButton: React.FC<
  Omit<ButtonProps, "bgColor" | "children"> & { version: GameVersion }
> = ({ version, ...rest }) => {
  /**
   * Specs from GameVersion.cs
   */
  const getSpecificProps =
    switchUtil<
      number,
      Record<number, () => Pick<ButtonProps, "bgColor" | "children">>
    >(version, {
      1: () => ({
        bgColor: theme.game.saphir,
        children: "Sapphire",
      }),
      2: () => ({
        bgColor: theme.game.ruby,
        children: "Ruby",
      }),
      3: () => ({
        bgColor: theme.game.emerald,
        children: "Emerald",
      }),
      4: () => ({
        bgColor: theme.game.red,
        children: "FireRed",
      }),
      5: () => ({
        // bgColor: theme.game.,
        children: "LeafGreen",
      }),

      7: () => ({
        bgColor: theme.game.gold,
        children: "HeartGold",
      }),
      8: () => ({
        bgColor: theme.game.silver,
        children: "SoulSilver",
      }),

      10: () => ({
        // bgColor: theme.game.,
        children: "Diamond",
      }),
      11: () => ({
        // bgColor: theme.game.,
        children: "Pearl",
      }),
      12: () => ({
        // bgColor: theme.game.,
        children: "Platinum",
      }),

      15: () => ({
        // bgColor: theme.game.,
        children: "ColosseumXD",
      }),

      20: () => ({
        // bgColor: theme.game.,
        children: "White",
      }),
      21: () => ({
        // bgColor: theme.game.,
        children: "Black",
      }),
      22: () => ({
        // bgColor: theme.game.,
        children: "White2",
      }),
      23: () => ({
        // bgColor: theme.game.,
        children: "Black2",
      }),

      24: () => ({
        // bgColor: theme.game.,
        children: "X",
      }),
      25: () => ({
        // bgColor: theme.game.,
        children: "Y",
      }),
      26: () => ({
        // bgColor: theme.game.,
        children: "Alpha Sapphire",
      }),
      27: () => ({
        // bgColor: theme.game.,
        children: "Omega Ruby",
      }),

      30: () => ({
        // bgColor: theme.game.,
        children: "Sun",
      }),
      31: () => ({
        // bgColor: theme.game.,
        children: "Moon",
      }),
      32: () => ({
        // bgColor: theme.game.,
        children: "UltraSun",
      }),
      33: () => ({
        // bgColor: theme.game.,
        children: "UltraMoon",
      }),

      34: () => ({
        // bgColor: theme.game.,
        children: "GO",
      }),

      35: () => ({
        bgColor: theme.game.red,
        children: "Red",
      }),
      36: () => ({
        bgColor: theme.game.blue,
        children: "Blue",
      }),
      37: () => ({
        bgColor: theme.game.blue,
        children: "Blue",
      }),
      38: () => ({
        bgColor: theme.game.yellow,
        children: "Yellow",
      }),
      39: () => ({
        bgColor: theme.game.gold,
        children: "Gold",
      }),
      40: () => ({
        bgColor: theme.game.silver,
        children: "Silver",
      }),
      41: () => ({
        bgColor: theme.game.crystal,
        children: "Crystal",
      }),

      42: () => ({
        // bgColor: theme.game.,
        children: "Let's Go, Pikachu!",
      }),
      43: () => ({
        // bgColor: theme.game.,
        children: "Let's Go, Eevee!",
      }),
      44: () => ({
        // bgColor: theme.game.,
        children: "Sword",
      }),
      45: () => ({
        // bgColor: theme.game.,
        children: "Shield",
      }),
      47: () => ({
        // bgColor: theme.game.,
        children: "Arceus",
      }),
      48: () => ({
        // bgColor: theme.game.,
        children: "Br. Diamond",
      }),
      49: () => ({
        // bgColor: theme.game.,
        children: "Sh. Pearl",
      }),
      50: () => ({
        // bgColor: theme.game.,
        children: "Scarlet",
      }),
      51: () => ({
        // bgColor: theme.game.,
        children: "Violet",
      }),

      // Game groupings

      52: () => ({
        bgColor: theme.game.blue,
        children: "RB",
      }),
      53: () => ({
        bgColor: theme.game.yellow,
        children: "RBY",
      }),

      54: () => ({
        bgColor: theme.game.silver,
        children: "GS",
      }),
      55: () => ({
        bgColor: theme.game.crystal,
        children: "GSC",
      }),

      56: () => ({
        bgColor: theme.game.saphir,
        children: "RS",
      }),
      57: () => ({
        bgColor: theme.game.emerald,
        children: "RSE",
      }),

      58: () => ({
        bgColor: theme.game.red,
        children: "FRLG",
      }),
      59: () => ({
        // bgColor: theme.game.,
        children: "RSBOX",
      }),
      60: () => ({
        // bgColor: theme.game.,
        children: "COLO",
      }),
      61: () => ({
        // bgColor: theme.game.,
        children: "XD",
      }),
      62: () => ({
        // bgColor: theme.game.,
        children: "DP",
      }),
      63: () => ({
        // bgColor: theme.game.,
        children: "DPPt",
      }),
      64: () => ({
        // bgColor: theme.game.,
        children: "HGSS",
      }),
      65: () => ({
        // bgColor: theme.game.,
        children: "BATREV",
      }),
      66: () => ({
        // bgColor: theme.game.,
        children: "BW",
      }),
      67: () => ({
        // bgColor: theme.game.,
        children: "B2W2",
      }),
      68: () => ({
        // bgColor: theme.game.,
        children: "XY",
      }),
      69: () => ({
        // bgColor: theme.game.,
        children: "ORASDEMO",
      }),
      70: () => ({
        // bgColor: theme.game.,
        children: "ORAS",
      }),
      71: () => ({
        // bgColor: theme.game.,
        children: "SM",
      }),
      72: () => ({
        // bgColor: theme.game.,
        children: "USUM",
      }),
      73: () => ({
        // bgColor: theme.game.,
        children: "GG",
      }),
      74: () => ({
        // bgColor: theme.game.,
        children: "SWSH",
      }),
      75: () => ({
        // bgColor: theme.game.,
        children: "BDSP",
      }),
      76: () => ({
        // bgColor: theme.game.,
        children: "SV",
      }),
      77: () => ({
        // bgColor: theme.game.,
        children: "Gen1",
      }),
      78: () => ({
        // bgColor: theme.game.,
        children: "Gen2",
      }),
      79: () => ({
        // bgColor: theme.game.,
        children: "Gen3",
      }),
      80: () => ({
        // bgColor: theme.game.,
        children: "Gen4",
      }),
      81: () => ({
        // bgColor: theme.game.,
        children: "Gen5",
      }),
      82: () => ({
        // bgColor: theme.game.,
        children: "Gen6",
      }),
      83: () => ({
        // bgColor: theme.game.,
        children: "Gen7",
      }),
      84: () => ({
        // bgColor: theme.game.,
        children: "Gen7b",
      }),
      85: () => ({
        // bgColor: theme.game.,
        children: "Gen8",
      }),
      86: () => ({
        // bgColor: theme.game.,
        children: "Gen9",
      }),
      87: () => ({
        // bgColor: theme.game.,
        children: "StadiumJ",
      }),
      88: () => ({
        // bgColor: theme.game.,
        children: "Stadium",
      }),
      89: () => ({
        // bgColor: theme.game.,
        children: "Stadium2",
      }),
      90: () => ({
        // bgColor: theme.game.,
        children: "EFL",
      }),
    }) ??
    (() => {
      throw new Error("Version not handled " + version);
    });

  return <Button {...getSpecificProps()} {...rest} />;
};
