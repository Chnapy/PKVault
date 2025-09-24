import type React from 'react';
import { useStaticData } from '../../hooks/use-static-data';
import { css, cx } from '@emotion/css';

type SpeciesImgProps = {
    species: number;
    isShiny?: boolean;
    isEgg?: boolean;
    isShadow?: boolean;
    small?: boolean;
} & React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;

export const SpeciesImg: React.FC<SpeciesImgProps> = ({ species, isShiny, isEgg, isShadow, small, ...imgProps }) => {
    const staticData = useStaticData();

    const sprite = isEgg
        ? staticData.eggSprite
        : (isShiny
            ? staticData.species[ species ].spriteShiny
            : staticData.species[ species ].spriteDefault);

    return <img
        src={sprite}
        alt={'species-' + species}
        loading='lazy'
        {...imgProps}
        className={cx(css({
            imageRendering: small ? undefined : "pixelated",
            height: small ? 48 : 96,
            width: small ? 48 : 96,
            display: "block",
            filter: isShadow ? 'drop-shadow(#770044 0px 0px 6px)' : undefined,
        }), imgProps.className)}
    />;
};
