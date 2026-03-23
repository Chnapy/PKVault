import { css, cx } from '@emotion/css';
import type React from 'react';
import curedIconImg from '../../assets/misc_icons/cured.png';
import infectedIconImg from '../../assets/misc_icons/infected.png';

export const PokerusIcon: React.FC<React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> & {
    cured?: boolean;
}> = ({ cured, ...props }) => {
    return <img
        src={cured ? curedIconImg : infectedIconImg}
        alt='pokerus-icon'
        {...props}
        className={cx(css({
            height: 20,
        }), props.className)}
    />;
};
