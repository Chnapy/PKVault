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
    0: () => ({ img: normalImg, color: theme.type.normal }),
    1: () => ({ img: fightingImg, color: theme.type.fighting }),
    2: () => ({ img: flyingImg, color: theme.type.fly }),
    3: () => ({ img: poisonImg, color: theme.type.poison }),
    4: () => ({ img: groundImg, color: theme.type.ground }),
    5: () => ({ img: rockImg, color: theme.type.rock }),
    6: () => ({ img: bugImg, color: theme.type.bug }),
    7: () => ({ img: ghostImg, color: theme.type.ghost }),
    8: () => ({ img: steelImg, color: theme.type.steel }),
    9: () => ({ img: fireImg, color: theme.type.fire }),
    10: () => ({ img: waterImg, color: theme.type.water }),
    11: () => ({ img: grassImg, color: theme.type.grass }),
    12: () => ({ img: electricImg, color: theme.type.electric }),
    13: () => ({ img: psychicImg, color: theme.type.psychic }),
    14: () => ({ img: iceImg, color: theme.type.ice }),
    15: () => ({ img: dragonImg, color: theme.type.dragon }),
    16: () => ({ img: darkImg, color: theme.type.dark }),
    17: () => ({ img: fairyImg, color: theme.type.fairy }),
})();
