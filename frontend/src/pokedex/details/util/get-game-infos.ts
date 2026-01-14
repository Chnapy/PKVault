import { GameVersion } from "../../../data/sdk/model";
import { theme } from "../../../ui/theme";
import { switchUtil } from "../../../util/switch-util";

import alphaSapphireImg from '../../../assets/game_icons/alpha-sapphire.png';
import blackImg from '../../../assets/game_icons/black.png';
import black2Img from '../../../assets/game_icons/black2.png';
import blueImg from '../../../assets/game_icons/blue.png';
import battleRevImg from '../../../assets/game_icons/battle-rev.png';
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
import zaImg from '../../../assets/game_icons/legend-za.png';

export const getGameInfos = (version: GameVersion | null, isEnabled: boolean = true): {
  img: string;
  color: string;
} => {
  if (!isEnabled) {
    return {
      img: getGameInfos(null).img,
      color: theme.bg.dark,
    };
  }

  // pkvault
  if (!version) {
    return {
      img: '/logo.svg',
      color: theme.bg.contrast,
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
        color: theme.game.saphir,
      }),
      [ GameVersion.R ]: () => ({
        img: rubyImg,
        color: theme.game.ruby,
      }),
      [ GameVersion.E ]: () => ({
        img: emeraldImg,
        color: theme.game.emerald,
      }),
      [ GameVersion.FR ]: () => ({
        img: fireredImg,
        color: theme.game.red,
      }),
      [ GameVersion.LG ]: () => ({
        img: leafgreenImg,
        // color: theme.game.,
      }),

      [ GameVersion.HG ]: () => ({
        img: heartgoldImg,
        color: theme.game.gold,
      }),
      [ GameVersion.SS ]: () => ({
        img: soulsilverImg,
        color: theme.game.silver,
      }),

      [ GameVersion.D ]: () => ({
        img: diamondImg,
        // color: theme.game.,
      }),
      [ GameVersion.P ]: () => ({
        img: pearlImg,
        // color: theme.game.,
      }),
      [ GameVersion.Pt ]: () => ({
        img: platinumImg,
        // color: theme.game.,
      }),

      [ GameVersion.CXD ]: () => ({
        img: colosseumImg,
        // color: theme.game.,
      }),

      [ GameVersion.BATREV ]: () => ({
        img: battleRevImg,
        // color: theme.game.,
      }),

      [ GameVersion.W ]: () => ({
        img: whiteImg,
        // color: theme.game.,
      }),
      [ GameVersion.B ]: () => ({
        img: blackImg,
        // color: theme.game.,
      }),
      [ GameVersion.W2 ]: () => ({
        img: white2Img,
        // color: theme.game.,
      }),
      [ GameVersion.B2 ]: () => ({
        img: black2Img,
        // color: theme.game.,
      }),

      [ GameVersion.X ]: () => ({
        img: xImg,
        // color: theme.game.,
      }),
      [ GameVersion.Y ]: () => ({
        img: yImg,
        // color: theme.game.,
      }),
      [ GameVersion.AS ]: () => ({
        img: alphaSapphireImg,
        // color: theme.game.,
      }),
      [ GameVersion.OR ]: () => ({
        img: omegaRubyImg,
        // color: theme.game.,
      }),

      [ GameVersion.SN ]: () => ({
        img: sunImg,
        // color: theme.game.,
      }),
      [ GameVersion.MN ]: () => ({
        img: moonImg,
        // color: theme.game.,
      }),
      [ GameVersion.US ]: () => ({
        img: ultraSunImg,
        // color: theme.game.,
      }),
      [ GameVersion.UM ]: () => ({
        img: ultraMoonImg,
        // color: theme.game.,
      }),

      [ GameVersion.GO ]: () => ({
        img: goImg,
        // color: theme.game.,
      }),

      [ GameVersion.RD ]: () => ({
        img: redImg,
        color: theme.game.red,
      }),
      [ GameVersion.GN ]: () => ({
        img: blueImg,
        color: theme.game.blue,
      }),
      [ GameVersion.BU ]: () => ({
        img: blueImg,
        color: theme.game.blue,
      }),
      [ GameVersion.YW ]: () => ({
        img: yellowImg,
        color: theme.game.yellow,
      }),
      [ GameVersion.GD ]: () => ({
        img: goldImg,
        color: theme.game.gold,
      }),
      [ GameVersion.SI ]: () => ({
        img: silverImg,
        color: theme.game.silver,
      }),
      [ GameVersion.C ]: () => ({
        img: crystalImg,
        color: theme.game.crystal,
      }),

      [ GameVersion.GP ]: () => ({
        img: letsgopikachuImg,
        // color: theme.game.,
      }),
      [ GameVersion.GE ]: () => ({
        img: letsgoevoliImg,
        // color: theme.game.,
      }),
      [ GameVersion.SW ]: () => ({
        img: swordImg,
        // color: theme.game.,
      }),
      [ GameVersion.SH ]: () => ({
        img: shieldImg,
        // color: theme.game.,
      }),
      [ GameVersion.PLA ]: () => ({
        img: legendImg,
        // color: theme.game.,
      }),
      [ GameVersion.BD ]: () => ({
        img: brillantDiamondImg,
        // color: theme.game.,
      }),
      [ GameVersion.SP ]: () => ({
        img: shiningPearlImg,
        // color: theme.game.,
      }),
      [ GameVersion.SL ]: () => ({
        img: scarletImg,
        // color: theme.game.,
      }),
      [ GameVersion.VL ]: () => ({
        img: violetImg,
        // color: theme.game.,
      }),
      [ GameVersion.ZA ]: () => ({
        img: zaImg,
        color: theme.game.za,
      }),

      // Game groupings

      [ GameVersion.RB ]: () => ({
        img: blueImg,
        color: theme.game.blue,
      }),
      [ GameVersion.RBY ]: () => ({
        img: yellowImg,
        color: theme.game.yellow,
      }),

      [ GameVersion.GS ]: () => ({
        img: silverImg,
        color: theme.game.silver,
      }),
      [ GameVersion.GSC ]: () => ({
        img: crystalImg,
        color: theme.game.crystal,
      }),

      [ GameVersion.RS ]: () => ({
        img: sapphireImg,
        color: theme.game.saphir,
      }),
      [ GameVersion.RSE ]: () => ({
        img: emeraldImg,
        color: theme.game.emerald,
      }),

      [ GameVersion.FRLG ]: () => ({
        img: fireredImg,
        color: theme.game.red,
      }),
      [ GameVersion.RSBOX ]: () => ({
        img: boxRSImg,
        // color: theme.game.,
      }),
      [ GameVersion.COLO ]: () => ({
        img: colosseumImg,
        // color: theme.game.,
      }),
      [ GameVersion.XD ]: () => ({
        img: xdImg,
        // color: theme.game.,
      }),
      [ GameVersion.DP ]: () => ({
        img: diamondImg,
        // color: theme.game.,
      }),
      [ GameVersion.DPPt ]: () => ({
        img: platinumImg,
        // color: theme.game.,
      }),
      [ GameVersion.HGSS ]: () => ({
        img: soulsilverImg,
        // color: theme.game.,
      }),
      // [ GameVersion.]: () => ({
      //   // color: theme.game.,
      // }),
      [ GameVersion.BW ]: () => ({
        img: blackImg,
        // color: theme.game.,
      }),
      [ GameVersion.B2W2 ]: () => ({
        img: black2Img,
        // color: theme.game.,
      }),
      [ GameVersion.XY ]: () => ({
        img: xImg,
        // color: theme.game.,
      }),
      [ GameVersion.ORASDEMO ]: () => ({
        img: omegaRubyImg,
        // color: theme.game.,
      }),
      [ GameVersion.ORAS ]: () => ({
        img: omegaRubyImg,
        // color: theme.game.,
      }),
      [ GameVersion.SM ]: () => ({
        img: sunImg,
        // color: theme.game.,
      }),
      [ GameVersion.USUM ]: () => ({
        img: ultraSunImg,
        // color: theme.game.,
      }),
      [ GameVersion.GG ]: () => ({
        img: letsgopikachuImg,
        // color: theme.game.,
      }),
      [ GameVersion.SWSH ]: () => ({
        img: swordImg,
        // color: theme.game.,
      }),
      [ GameVersion.BDSP ]: () => ({
        img: brillantDiamondImg,
        // color: theme.game.,
      }),
      [ GameVersion.SV ]: () => ({
        img: scarletImg,
        // color: theme.game.,
      }),
      [ GameVersion.Gen1 ]: () => ({
        img: yellowImg,
        // color: theme.game.,
      }),
      [ GameVersion.Gen2 ]: () => ({
        img: crystalImg,
        // color: theme.game.,
      }),
      [ GameVersion.Gen3 ]: () => ({
        img: emeraldImg,
        // color: theme.game.,
      }),
      [ GameVersion.Gen4 ]: () => ({
        img: platinumImg,
        // color: theme.game.,
      }),
      [ GameVersion.Gen5 ]: () => ({
        img: blackImg,
        // color: theme.game.,
      }),
      [ GameVersion.Gen6 ]: () => ({
        img: xImg,
        // color: theme.game.,
      }),
      [ GameVersion.Gen7 ]: () => ({
        img: sunImg,
        // color: theme.game.,
      }),
      [ GameVersion.Gen7b ]: () => ({
        img: letsgopikachuImg,
        // color: theme.game.,
      }),
      [ GameVersion.Gen8 ]: () => ({
        img: swordImg,
        // color: theme.game.,
      }),
      [ GameVersion.Gen9 ]: () => ({
        img: scarletImg,
        // color: theme.game.,
      }),
      [ GameVersion.StadiumJ ]: () => ({
        // color: theme.game.,
      }),
      [ GameVersion.Stadium ]: () => ({
        // color: theme.game.,
      }),
      [ GameVersion.Stadium2 ]: () => ({
        // color: theme.game.,
      }),
      [ GameVersion.EFL ]: () => ({
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
