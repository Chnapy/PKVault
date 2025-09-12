import type { GameVersion } from "../../../data/sdk/model";
import { theme } from "../../../ui/theme";
import { switchUtil } from "../../../util/switch-util";

import alphaSapphireImg from '../../../assets/game_icons/alpha-sapphire.png';
import blackImg from '../../../assets/game_icons/black.png';
import black2Img from '../../../assets/game_icons/black2.png';
import blueImg from '../../../assets/game_icons/blue.png';
import boxRSImg from '../../../assets/game_icons/box-rs.png';
import brillantDiamondImg from '../../../assets/game_icons/brillant-diamond.png';
import colosseumImg from '../../../assets/game_icons/colosseum.png';
import crystalImg from '../../../assets/game_icons/crystal.png';
import defaultImg from '../../../assets/game_icons/default.png';
import diamondImg from '../../../assets/game_icons/diamond.png';
import emeraldImg from '../../../assets/game_icons/emerald.png';
import fireredImg from '../../../assets/game_icons/firered.png';
import goImg from '../../../assets/game_icons/go.png';
import goldImg from '../../../assets/game_icons/gold.png';
import heartgoldImg from '../../../assets/game_icons/heartgold.png';
import leafgreenImg from '../../../assets/game_icons/leafgreen.png';
import legendImg from '../../../assets/game_icons/legend-arceus.png';
import letsgoevoliImg from '../../../assets/game_icons/letsgoevoli.png';
import letsgopikachuImg from '../../../assets/game_icons/letsgopikachu.png';
import moonImg from '../../../assets/game_icons/moon.png';
import omegaRubyImg from '../../../assets/game_icons/omega-ruby.png';
import pearlImg from '../../../assets/game_icons/pearl.png';
import platinumImg from '../../../assets/game_icons/platinum.png';
import redImg from '../../../assets/game_icons/red.png';
import rubyImg from '../../../assets/game_icons/ruby.png';
import sapphireImg from '../../../assets/game_icons/sapphire.png';
import scarletImg from '../../../assets/game_icons/scarlet.png';
import shieldImg from '../../../assets/game_icons/shield.png';
import shiningPearlImg from '../../../assets/game_icons/shining-pearl.png';
import silverImg from '../../../assets/game_icons/silver.png';
import soulsilverImg from '../../../assets/game_icons/soulsilver.png';
import sunImg from '../../../assets/game_icons/sun.png';
import swordImg from '../../../assets/game_icons/sword.png';
import ultraMoonImg from '../../../assets/game_icons/ultra-moon.png';
import ultraSunImg from '../../../assets/game_icons/ultra-sun.png';
import violetImg from '../../../assets/game_icons/violet.png';
import whiteImg from '../../../assets/game_icons/white.png';
import white2Img from '../../../assets/game_icons/white2.png';
import xImg from '../../../assets/game_icons/x.png';
import xdImg from '../../../assets/game_icons/xd.png';
import yImg from '../../../assets/game_icons/y.png';
import yellowImg from '../../../assets/game_icons/yellow.png';

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
          img?: string;
          color?: string;
        }
      >
    >(version, {
      1: () => ({
        img: sapphireImg,
        color: theme.game.saphir,
      }),
      2: () => ({
        img: rubyImg,
        color: theme.game.ruby,
      }),
      3: () => ({
        img: emeraldImg,
        color: theme.game.emerald,
      }),
      4: () => ({
        img: fireredImg,
        color: theme.game.red,
      }),
      5: () => ({
        img: leafgreenImg,
        // color: theme.game.,
      }),

      7: () => ({
        img: heartgoldImg,
        color: theme.game.gold,
      }),
      8: () => ({
        img: soulsilverImg,
        color: theme.game.silver,
      }),

      10: () => ({
        img: diamondImg,
        // color: theme.game.,
      }),
      11: () => ({
        img: pearlImg,
        // color: theme.game.,
      }),
      12: () => ({
        img: platinumImg,
        // color: theme.game.,
      }),

      15: () => ({
        img: colosseumImg,
        // color: theme.game.,
      }),

      20: () => ({
        img: whiteImg,
        // color: theme.game.,
      }),
      21: () => ({
        img: blackImg,
        // color: theme.game.,
      }),
      22: () => ({
        img: white2Img,
        // color: theme.game.,
      }),
      23: () => ({
        img: black2Img,
        // color: theme.game.,
      }),

      24: () => ({
        img: xImg,
        // color: theme.game.,
      }),
      25: () => ({
        img: yImg,
        // color: theme.game.,
      }),
      26: () => ({
        img: alphaSapphireImg,
        // color: theme.game.,
      }),
      27: () => ({
        img: omegaRubyImg,
        // color: theme.game.,
      }),

      30: () => ({
        img: sunImg,
        // color: theme.game.,
      }),
      31: () => ({
        img: moonImg,
        // color: theme.game.,
      }),
      32: () => ({
        img: ultraSunImg,
        // color: theme.game.,
      }),
      33: () => ({
        img: ultraMoonImg,
        // color: theme.game.,
      }),

      34: () => ({
        img: goImg,
        // color: theme.game.,
      }),

      35: () => ({
        img: redImg,
        color: theme.game.red,
      }),
      36: () => ({
        img: blueImg,
        color: theme.game.blue,
      }),
      37: () => ({
        img: blueImg,
        color: theme.game.blue,
      }),
      38: () => ({
        img: yellowImg,
        color: theme.game.yellow,
      }),
      39: () => ({
        img: goldImg,
        color: theme.game.gold,
      }),
      40: () => ({
        img: silverImg,
        color: theme.game.silver,
      }),
      41: () => ({
        img: crystalImg,
        color: theme.game.crystal,
      }),

      42: () => ({
        img: letsgopikachuImg,
        // color: theme.game.,
      }),
      43: () => ({
        img: letsgoevoliImg,
        // color: theme.game.,
      }),
      44: () => ({
        img: swordImg,
        // color: theme.game.,
      }),
      45: () => ({
        img: shieldImg,
        // color: theme.game.,
      }),
      47: () => ({
        img: legendImg,
        // color: theme.game.,
      }),
      48: () => ({
        img: brillantDiamondImg,
        // color: theme.game.,
      }),
      49: () => ({
        img: shiningPearlImg,
        // color: theme.game.,
      }),
      50: () => ({
        img: scarletImg,
        // color: theme.game.,
      }),
      51: () => ({
        img: violetImg,
        // color: theme.game.,
      }),

      // Game groupings

      52: () => ({
        img: blueImg,
        color: theme.game.blue,
      }),
      53: () => ({
        img: yellowImg,
        color: theme.game.yellow,
      }),

      54: () => ({
        img: silverImg,
        color: theme.game.silver,
      }),
      55: () => ({
        img: crystalImg,
        color: theme.game.crystal,
      }),

      56: () => ({
        img: sapphireImg,
        color: theme.game.saphir,
      }),
      57: () => ({
        img: emeraldImg,
        color: theme.game.emerald,
      }),

      58: () => ({
        img: fireredImg,
        color: theme.game.red,
      }),
      59: () => ({
        img: boxRSImg,
        // color: theme.game.,
      }),
      60: () => ({
        img: colosseumImg,
        // color: theme.game.,
      }),
      61: () => ({
        img: xdImg,
        // color: theme.game.,
      }),
      62: () => ({
        img: diamondImg,
        // color: theme.game.,
      }),
      63: () => ({
        img: platinumImg,
        // color: theme.game.,
      }),
      64: () => ({
        img: soulsilverImg,
        // color: theme.game.,
      }),
      65: () => ({
        // color: theme.game.,
      }),
      66: () => ({
        img: blackImg,
        // color: theme.game.,
      }),
      67: () => ({
        img: black2Img,
        // color: theme.game.,
      }),
      68: () => ({
        img: xImg,
        // color: theme.game.,
      }),
      69: () => ({
        img: omegaRubyImg,
        // color: theme.game.,
      }),
      70: () => ({
        img: omegaRubyImg,
        // color: theme.game.,
      }),
      71: () => ({
        img: sunImg,
        // color: theme.game.,
      }),
      72: () => ({
        img: ultraSunImg,
        // color: theme.game.,
      }),
      73: () => ({
        img: letsgopikachuImg,
        // color: theme.game.,
      }),
      74: () => ({
        img: swordImg,
        // color: theme.game.,
      }),
      75: () => ({
        img: brillantDiamondImg,
        // color: theme.game.,
      }),
      76: () => ({
        img: scarletImg,
        // color: theme.game.,
      }),
      77: () => ({
        img: yellowImg,
        // color: theme.game.,
      }),
      78: () => ({
        img: crystalImg,
        // color: theme.game.,
      }),
      79: () => ({
        img: emeraldImg,
        // color: theme.game.,
      }),
      80: () => ({
        img: platinumImg,
        // color: theme.game.,
      }),
      81: () => ({
        img: blackImg,
        // color: theme.game.,
      }),
      82: () => ({
        img: xImg,
        // color: theme.game.,
      }),
      83: () => ({
        img: sunImg,
        // color: theme.game.,
      }),
      84: () => ({
        img: letsgopikachuImg,
        // color: theme.game.,
      }),
      85: () => ({
        img: swordImg,
        // color: theme.game.,
      }),
      86: () => ({
        img: scarletImg,
        // color: theme.game.,
      }),
      87: () => ({
        // color: theme.game.,
      }),
      88: () => ({
        // color: theme.game.,
      }),
      89: () => ({
        // color: theme.game.,
      }),
      90: () => ({
        img: emeraldImg,
        // color: theme.game.,
      }),
    }) ??
    (() => ({

    }));

  const gameData = data();

  return {
    ...gameData,
    img: gameData.img ?? defaultImg,
    color: gameData.color ?? theme.bg.dark,
  } satisfies typeof gameData;
};
