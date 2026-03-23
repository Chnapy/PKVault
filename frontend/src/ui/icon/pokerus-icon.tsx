import { css, cx } from '@emotion/css';
import type React from 'react';
import { iconResources } from './icon-resources';

export const PokerusIcon: React.FC<React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> & {
    cured?: boolean;
}> = ({ cured, ...props }) => {
    return <img
        src={cured
            ? iconResources.misc.pokerusCured
            : iconResources.misc.pokerusInfected}
        alt='pokerus-icon'
        {...props}
        className={cx(css({
            height: 20,
        }), props.className)}
    />;
};
