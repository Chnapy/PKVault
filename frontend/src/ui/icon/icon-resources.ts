import alpha from '../../assets/pkhex/alpha.png';
import shiny from '../../assets/pkhex/rare_icon.png';

import physical from '../../assets/move_categories/physical.png';
import special from '../../assets/move_categories/special.png';
import status from '../../assets/move_categories/status.png';

import bug from '../../assets/type_icons/bug.png';
import dark from '../../assets/type_icons/dark.png';
import dragon from '../../assets/type_icons/dragon.png';
import electric from '../../assets/type_icons/electric.png';
import fairy from '../../assets/type_icons/fairy.png';
import fighting from '../../assets/type_icons/fighting.png';
import fire from '../../assets/type_icons/fire.png';
import flying from '../../assets/type_icons/flying.png';
import ghost from '../../assets/type_icons/ghost.png';
import grass from '../../assets/type_icons/grass.png';
import ground from '../../assets/type_icons/ground.png';
import ice from '../../assets/type_icons/ice.png';
import normal from '../../assets/type_icons/normal.png';
import poison from '../../assets/type_icons/poison.png';
import psychic from '../../assets/type_icons/psychic.png';
import rock from '../../assets/type_icons/rock.png';
import steel from '../../assets/type_icons/steel.png';
import stellar from '../../assets/type_icons/stellar.png';
import unknown from '../../assets/type_icons/unknown.png';
import water from '../../assets/type_icons/water.png';

import pokerusCured from '../../assets/misc_icons/cured.png';
import pokerusInfected from '../../assets/misc_icons/infected.png';
import teraMask from '../../assets/misc_icons/tera_mask.svg';

/**
 * Centralize icon img imports.
 */
export const iconResources = {
    pkhex: {
        shiny,
        alpha,
    },
    moveCategory: {
        physical,
        special,
        status,
    },
    type: {
        bug,
        dark,
        dragon,
        electric,
        fairy,
        fighting,
        fire,
        flying,
        ghost,
        grass,
        ground,
        ice,
        normal,
        poison,
        psychic,
        rock,
        steel,
        stellar,
        unknown,
        water,
    },
    misc: {
        pokerusInfected,
        pokerusCured,
        teraMask,
    }
} satisfies Record<string, Record<string, string>>;
