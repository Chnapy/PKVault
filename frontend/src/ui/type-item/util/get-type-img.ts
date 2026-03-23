import { switchUtil } from '../../../util/switch-util';
import { iconResources } from '../../icon/icon-resources';
import { theme } from '../../theme';

export const getTypeImg = (type: number) => switchUtil(type, {
    1: () => ({ img: iconResources.type.normal, color: theme.type.normal }),
    2: () => ({ img: iconResources.type.fighting, color: theme.type.fighting }),
    3: () => ({ img: iconResources.type.flying, color: theme.type.fly }),
    4: () => ({ img: iconResources.type.poison, color: theme.type.poison }),
    5: () => ({ img: iconResources.type.ground, color: theme.type.ground }),
    6: () => ({ img: iconResources.type.rock, color: theme.type.rock }),
    7: () => ({ img: iconResources.type.bug, color: theme.type.bug }),
    8: () => ({ img: iconResources.type.ghost, color: theme.type.ghost }),
    9: () => ({ img: iconResources.type.steel, color: theme.type.steel }),
    10: () => ({ img: iconResources.type.fire, color: theme.type.fire }),
    11: () => ({ img: iconResources.type.water, color: theme.type.water }),
    12: () => ({ img: iconResources.type.grass, color: theme.type.grass }),
    13: () => ({ img: iconResources.type.electric, color: theme.type.electric }),
    14: () => ({ img: iconResources.type.psychic, color: theme.type.psychic }),
    15: () => ({ img: iconResources.type.ice, color: theme.type.ice }),
    16: () => ({ img: iconResources.type.dragon, color: theme.type.dragon }),
    17: () => ({ img: iconResources.type.dark, color: theme.type.dark }),
    18: () => ({ img: iconResources.type.fairy, color: theme.type.fairy }),
    19: () => ({ img: iconResources.type.stellar, color: theme.type.stellar }),
})?.() ?? {
    img: iconResources.type.unknown,
    color: theme.type.unknown
};
