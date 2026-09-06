import type React from 'react';
import { iconResources } from './resources/icon-resources';
import { UIIcon, type UIIconProps } from './ui-icon';

export const UIPokerusIcon: React.FC<Omit<UIIconProps, 'src' | 'alt'> & {
    cured?: boolean;
}> = ({ cured, ...props }) => {
    return <UIIcon
        src={cured
            ? iconResources.misc.pokerusCured
            : iconResources.misc.pokerusInfected}
        alt='pokerus-icon'
        {...props}
    />;
};
