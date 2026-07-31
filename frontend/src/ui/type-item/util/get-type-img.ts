import { iconResources } from '../../icon/resources/icon-resources';
import { switchUtil } from '../../../util/switch-util';
import { baseTheme } from '../../base-theme';

export const getTypeImg = (type: number) => switchUtil(type, {
    1: () => ({ img: iconResources.type.normal, color: baseTheme.other.type.normal }),
    2: () => ({ img: iconResources.type.fighting, color: baseTheme.other.type.fighting }),
    3: () => ({ img: iconResources.type.flying, color: baseTheme.other.type.fly }),
    4: () => ({ img: iconResources.type.poison, color: baseTheme.other.type.poison }),
    5: () => ({ img: iconResources.type.ground, color: baseTheme.other.type.ground }),
    6: () => ({ img: iconResources.type.rock, color: baseTheme.other.type.rock }),
    7: () => ({ img: iconResources.type.bug, color: baseTheme.other.type.bug }),
    8: () => ({ img: iconResources.type.ghost, color: baseTheme.other.type.ghost }),
    9: () => ({ img: iconResources.type.steel, color: baseTheme.other.type.steel }),
    10: () => ({ img: iconResources.type.fire, color: baseTheme.other.type.fire }),
    11: () => ({ img: iconResources.type.water, color: baseTheme.other.type.water }),
    12: () => ({ img: iconResources.type.grass, color: baseTheme.other.type.grass }),
    13: () => ({ img: iconResources.type.electric, color: baseTheme.other.type.electric }),
    14: () => ({ img: iconResources.type.psychic, color: baseTheme.other.type.psychic }),
    15: () => ({ img: iconResources.type.ice, color: baseTheme.other.type.ice }),
    16: () => ({ img: iconResources.type.dragon, color: baseTheme.other.type.dragon }),
    17: () => ({ img: iconResources.type.dark, color: baseTheme.other.type.dark }),
    18: () => ({ img: iconResources.type.fairy, color: baseTheme.other.type.fairy }),
    19: () => ({ img: iconResources.type.stellar, color: baseTheme.other.type.stellar }),
})?.() ?? {
    img: iconResources.type.unknown,
    color: baseTheme.other.type.unknown
};
