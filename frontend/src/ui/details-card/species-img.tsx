import { css, cx } from '@emotion/css';
import type React from 'react';
import { getApiFullUrl } from '../../data/mutator/custom-instance';
import { useStaticData } from '../../hooks/use-static-data';

type SpeciesImgProps = {
    species: number;
    form: number;
    isShiny?: boolean;
    isEgg?: boolean;
    isShadow?: boolean;
    small?: boolean;
} & React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;

export const SpeciesImg: React.FC<SpeciesImgProps> = ({ species, form, isShiny, isEgg, isShadow, small, ...imgProps }) => {
    const staticData = useStaticData();

    const { spriteDefault, spriteShiny } = staticData.species[ species ].forms[ form ] ?? staticData.species[ species ].forms[ 0 ];

    const sprite = getApiFullUrl(isEgg
        ? staticData.eggSprite
        : (isShiny ? spriteShiny : spriteDefault));

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
