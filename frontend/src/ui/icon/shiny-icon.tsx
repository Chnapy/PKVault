import { css, cx } from '@emotion/css';
import type React from 'react';
import { iconResources } from './icon-resources';

export const ShinyIcon: React.FC<React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>> = (props) => {
    return <img
        src={iconResources.pkhex.shiny}
        alt='shiny-icon'
        {...props}
        className={cx(css({
            height: 20,
        }), props.className)}
    />;
};
