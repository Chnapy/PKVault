import { css, cx } from '@emotion/css';
import type React from 'react';
import { iconResources } from './icon-resources';

export const AlphaIcon: React.FC<React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>> = (props) => {
    return <img
        src={iconResources.pkhex.alpha}
        alt='alpha-icon'
        {...props}
        className={cx(css({
            height: 20,
        }), props.className)}
    />;
};
