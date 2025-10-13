import { css, cx } from '@emotion/css';
import type React from 'react';
import { getApiFullUrl } from '../../data/mutator/custom-instance';
import { useStaticData } from '../../hooks/use-static-data';

type SpeciesImgProps = {
    species: number;
    generation: number;
    form: number;
    isFemale?: boolean;
    isShiny?: boolean;
    isEgg?: boolean;
    isShadow?: boolean;
    small?: boolean;
} & React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;

export const SpeciesImg: React.FC<SpeciesImgProps> = ({ species, generation, form, isFemale, isShiny, isEgg, isShadow, small, ...imgProps }) => {
    const staticData = useStaticData();

    const staticForms = staticData.species[ species ].forms[ generation ];

    if (!staticForms?.[ form ]) {
        console.log('UNKNOWN FORM -', species, generation, form);
    }

    const { name, spriteDefault, spriteFemale, spriteShiny, spriteShinyFemale } = staticForms[ form ] ?? staticForms[ 0 ];

    const getSpriteUrl = (): string => {
        if (isEgg) {
            return staticData.eggSprite;
        }

        if (isShiny) {
            return isFemale ? spriteShinyFemale ?? spriteShiny : spriteShiny;
        }

        return isFemale ? spriteFemale ?? spriteDefault : spriteDefault;
    };

    const spriteUrl = getSpriteUrl();
    const sprite = getApiFullUrl(getSpriteUrl());

    if (!spriteUrl) {
        console.log('No sprite -', name, species, generation, form, staticForms);
    }

    return <img
        src={sprite}
        alt={`S-${species}-${generation}-${form}`}
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
