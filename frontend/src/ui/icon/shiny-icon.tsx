import type React from 'react';
import shinyIconImg from '../../assets/pkhex/rare_icon.png';
import { css, cx } from '@emotion/css';

export const ShinyIcon: React.FC<React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>> = (props) => {
    return <img
        src={shinyIconImg}
        alt='shiny-icon'
        {...props}
        className={cx(css({
            height: 20,
        }), props.className)}
    />;
};
