import type React from 'react';
import alphaIconImg from '../../assets/pkhex/alpha.png';

export const AlphaIcon: React.FC<React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>> = (props) => {
    return <img
        src={alphaIconImg}
        alt='alpha-icon'
        {...props}
        style={{
            height: 20,
            ...props.style,
        }}
    />;
};
