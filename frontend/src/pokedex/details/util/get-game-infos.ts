import { GameVersion } from "../../../data/sdk/model";
import { switchUtil } from "../../../util/switch-util";

import type { MantineColor } from '@mantine/core';
import alphaSapphireImg from '../../../assets/game_icons/alpha-sapphire.png';
import battleRevImg from '../../../assets/game_icons/battle-rev.png';
import blackImg from '../../../assets/game_icons/black.png';
import black2Img from '../../../assets/game_icons/black2.png';
import blueImg from '../../../assets/game_icons/blue.png';
import boxRSImg from '../../../assets/game_icons/box-rs.png';
import brilliantDiamondImg from '../../../assets/game_icons/brilliant-diamond.png';
import colosseumImg from '../../../assets/game_icons/colosseum.png';
import crystalImg from '../../../assets/game_icons/crystal.png';
import defaultImg from '../../../assets/game_icons/default.png';
import diamondImg from '../../../assets/game_icons/diamond.png';
import emeraldImg from '../../../assets/game_icons/emerald.png';
import fireRedImg from '../../../assets/game_icons/fire-red.png';
import goImg from '../../../assets/game_icons/go.png';
import goldImg from '../../../assets/game_icons/gold.png';
import heartGoldImg from '../../../assets/game_icons/heart-gold.png';
import leafGreenImg from '../../../assets/game_icons/leaf-green.png';
import legendImg from '../../../assets/game_icons/legend-arceus.png';
import zaImg from '../../../assets/game_icons/legend-za.png';
import letsGoEvoliImg from '../../../assets/game_icons/lets-go-evoli.png';
import letsGoPikachuImg from '../../../assets/game_icons/lets-go-pikachu.png';
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
import soulSilverImg from '../../../assets/game_icons/soul-silver.png';
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
import { baseTheme } from '../../../ui/base-theme';

export const getGameInfos = (version: GameVersion | null, isEnabled: boolean = true): {
  img: string;
  color: MantineColor;
} => {
  if (!isEnabled) {
    return {
      img: getGameInfos(null).img,
      color: 'dark',
    };
  }

  // pkvault
  if (!version) {
    return {
      img: '/logo.svg',
      color: 'primary',
    };
  }

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
      [ GameVersion.S ]: () => ({
        img: sapphireImg,
        color: baseTheme.other.game.sapphire,
      }),
      [ GameVersion.R ]: () => ({
        img: rubyImg,
        color: baseTheme.other.game.ruby,
      }),
      [ GameVersion.E ]: () => ({
        img: emeraldImg,
        color: baseTheme.other.game.emerald,
      }),
      [ GameVersion.FR ]: () => ({
        img: fireRedImg,
        color: baseTheme.other.game.red,
      }),
      [ GameVersion.LG ]: () => ({
        img: leafGreenImg,
        // color: baseTheme.other.game.,
      }),

      [ GameVersion.HG ]: () => ({
        img: heartGoldImg,
        color: baseTheme.other.game.gold,
      }),
      [ GameVersion.SS ]: () => ({
        img: soulSilverImg,
        color: baseTheme.other.game.silver,
      }),

      [ GameVersion.D ]: () => ({
        img: diamondImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.P ]: () => ({
        img: pearlImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.Pt ]: () => ({
        img: platinumImg,
        // color: baseTheme.other.game.,
      }),

      [ GameVersion.CXD ]: () => ({
        img: colosseumImg,
        // color: baseTheme.other.game.,
      }),

      [ GameVersion.BATREV ]: () => ({
        img: battleRevImg,
        // color: baseTheme.other.game.,
      }),

      [ GameVersion.W ]: () => ({
        img: whiteImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.B ]: () => ({
        img: blackImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.W2 ]: () => ({
        img: white2Img,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.B2 ]: () => ({
        img: black2Img,
        // color: baseTheme.other.game.,
      }),

      [ GameVersion.X ]: () => ({
        img: xImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.Y ]: () => ({
        img: yImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.AS ]: () => ({
        img: alphaSapphireImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.OR ]: () => ({
        img: omegaRubyImg,
        // color: baseTheme.other.game.,
      }),

      [ GameVersion.SN ]: () => ({
        img: sunImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.MN ]: () => ({
        img: moonImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.US ]: () => ({
        img: ultraSunImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.UM ]: () => ({
        img: ultraMoonImg,
        // color: baseTheme.other.game.,
      }),

      [ GameVersion.GO ]: () => ({
        img: goImg,
        // color: baseTheme.other.game.,
      }),

      [ GameVersion.RD ]: () => ({
        img: redImg,
        color: baseTheme.other.game.red,
      }),
      [ GameVersion.GN ]: () => ({
        img: blueImg,
        color: baseTheme.other.game.blue,
      }),
      [ GameVersion.BU ]: () => ({
        img: blueImg,
        color: baseTheme.other.game.blue,
      }),
      [ GameVersion.YW ]: () => ({
        img: yellowImg,
        color: baseTheme.other.game.yellow,
      }),
      [ GameVersion.GD ]: () => ({
        img: goldImg,
        color: baseTheme.other.game.gold,
      }),
      [ GameVersion.SI ]: () => ({
        img: silverImg,
        color: baseTheme.other.game.silver,
      }),
      [ GameVersion.C ]: () => ({
        img: crystalImg,
        color: baseTheme.other.game.crystal,
      }),

      [ GameVersion.GP ]: () => ({
        img: letsGoPikachuImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.GE ]: () => ({
        img: letsGoEvoliImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.SW ]: () => ({
        img: swordImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.SH ]: () => ({
        img: shieldImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.PLA ]: () => ({
        img: legendImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.BD ]: () => ({
        img: brilliantDiamondImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.SP ]: () => ({
        img: shiningPearlImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.SL ]: () => ({
        img: scarletImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.VL ]: () => ({
        img: violetImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.ZA ]: () => ({
        img: zaImg,
        color: baseTheme.other.game.za,
      }),
      [ GameVersion.CP ]: () => ({
        // color: baseTheme.other.game.,
      }),

      // Game groupings

      [ GameVersion.RB ]: () => ({
        img: blueImg,
        color: baseTheme.other.game.blue,
      }),
      [ GameVersion.RBY ]: () => ({
        img: yellowImg,
        color: baseTheme.other.game.yellow,
      }),

      [ GameVersion.GS ]: () => ({
        img: silverImg,
        color: baseTheme.other.game.silver,
      }),
      [ GameVersion.GSC ]: () => ({
        img: crystalImg,
        color: baseTheme.other.game.crystal,
      }),

      [ GameVersion.RS ]: () => ({
        img: sapphireImg,
        color: baseTheme.other.game.sapphire,
      }),
      [ GameVersion.RSE ]: () => ({
        img: emeraldImg,
        color: baseTheme.other.game.emerald,
      }),

      [ GameVersion.FRLG ]: () => ({
        img: fireRedImg,
        color: baseTheme.other.game.red,
      }),
      [ GameVersion.RSBOX ]: () => ({
        img: boxRSImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.COLO ]: () => ({
        img: colosseumImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.XD ]: () => ({
        img: xdImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.DP ]: () => ({
        img: diamondImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.DPPt ]: () => ({
        img: platinumImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.HGSS ]: () => ({
        img: soulSilverImg,
        // color: baseTheme.other.game.,
      }),
      // [ GameVersion.]: () => ({
      //   // color: baseTheme.other.game.,
      // }),
      [ GameVersion.BW ]: () => ({
        img: blackImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.B2W2 ]: () => ({
        img: black2Img,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.XY ]: () => ({
        img: xImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.ORASDEMO ]: () => ({
        img: omegaRubyImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.ORAS ]: () => ({
        img: omegaRubyImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.SM ]: () => ({
        img: sunImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.USUM ]: () => ({
        img: ultraSunImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.GG ]: () => ({
        img: letsGoPikachuImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.SWSH ]: () => ({
        img: swordImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.BDSP ]: () => ({
        img: brilliantDiamondImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.SV ]: () => ({
        img: scarletImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.Gen1 ]: () => ({
        img: yellowImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.Gen2 ]: () => ({
        img: crystalImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.Gen3 ]: () => ({
        img: emeraldImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.Gen4 ]: () => ({
        img: platinumImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.Gen5 ]: () => ({
        img: blackImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.Gen6 ]: () => ({
        img: xImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.Gen7 ]: () => ({
        img: sunImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.Gen7b ]: () => ({
        img: letsGoPikachuImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.Gen8 ]: () => ({
        img: swordImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.Gen9 ]: () => ({
        img: scarletImg,
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.StadiumJ ]: () => ({
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.Stadium ]: () => ({
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.Stadium2 ]: () => ({
        // color: baseTheme.other.game.,
      }),
      [ GameVersion.EFL ]: () => ({
        img: emeraldImg,
        // color: baseTheme.other.game.,
      }),
    }) ??
    (() => ({

    }));

  const gameData = data();

  return {
    ...gameData,
    img: gameData.img ?? defaultImg,
    color: gameData.color ?? 'dark',
  } satisfies typeof gameData;
};
