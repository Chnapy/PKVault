import { switchUtilRequired } from '../../../util/switch-util';

import bugImg from '../../../assets/type_icons/bug.png';
import darkImg from '../../../assets/type_icons/dark.png';
import dragonImg from '../../../assets/type_icons/dragon.png';
import electricImg from '../../../assets/type_icons/electric.png';
import fairyImg from '../../../assets/type_icons/fairy.png';
import fightingImg from '../../../assets/type_icons/fighting.png';
import fireImg from '../../../assets/type_icons/fire.png';
import flyingImg from '../../../assets/type_icons/flying.png';
import ghostImg from '../../../assets/type_icons/ghost.png';
import grassImg from '../../../assets/type_icons/grass.png';
import groundImg from '../../../assets/type_icons/ground.png';
import iceImg from '../../../assets/type_icons/ice.png';
import normalImg from '../../../assets/type_icons/normal.png';
import poisonImg from '../../../assets/type_icons/poison.png';
import psychicImg from '../../../assets/type_icons/psychic.png';
import rockImg from '../../../assets/type_icons/rock.png';
import steelImg from '../../../assets/type_icons/steel.png';
import waterImg from '../../../assets/type_icons/water.png';
import { theme } from '../../theme';

export const getTypeImg = (type: number) => switchUtilRequired(type, {
    1: () => ({ img: normalImg, color: theme.type.normal }),
    2: () => ({ img: fightingImg, color: theme.type.fighting }),
    3: () => ({ img: flyingImg, color: theme.type.fly }),
    4: () => ({ img: poisonImg, color: theme.type.poison }),
    5: () => ({ img: groundImg, color: theme.type.ground }),
    6: () => ({ img: rockImg, color: theme.type.rock }),
    7: () => ({ img: bugImg, color: theme.type.bug }),
    8: () => ({ img: ghostImg, color: theme.type.ghost }),
    9: () => ({ img: steelImg, color: theme.type.steel }),
    10: () => ({ img: fireImg, color: theme.type.fire }),
    11: () => ({ img: waterImg, color: theme.type.water }),
    12: () => ({ img: grassImg, color: theme.type.grass }),
    13: () => ({ img: electricImg, color: theme.type.electric }),
    14: () => ({ img: psychicImg, color: theme.type.psychic }),
    15: () => ({ img: iceImg, color: theme.type.ice }),
    16: () => ({ img: dragonImg, color: theme.type.dragon }),
    17: () => ({ img: darkImg, color: theme.type.dark }),
    18: () => ({ img: fairyImg, color: theme.type.fairy }),
})();
