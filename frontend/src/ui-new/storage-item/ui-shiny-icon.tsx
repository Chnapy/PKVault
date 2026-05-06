import { css, cx } from '@emotion/css';
import type React from 'react';
import { iconResources } from '../../ui/icon/icon-resources';

export const UIShinyIcon: React.FC<React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>> = (props) => {
    return <img
        src={iconResources.pkhex.shiny}
        alt='shiny'
        {...props}
        className={cx(css({
            height: 16,
        }), props.className)}
    />;
};
