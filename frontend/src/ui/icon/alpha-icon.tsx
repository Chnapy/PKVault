import type React from 'react';
import alphaIconImg from '../../assets/pkhex/alpha.png';
import { css, cx } from '@emotion/css';

export const AlphaIcon: React.FC<React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>> = (props) => {
    return <img
        src={alphaIconImg}
        alt='alpha-icon'
        {...props}
        className={cx(css({
            height: 20,
        }), props.className)}
    />;
};
