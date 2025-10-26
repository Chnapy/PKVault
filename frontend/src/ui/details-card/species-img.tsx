import { css, cx } from '@emotion/css';
import type React from 'react';
import { useStaticData } from '../../hooks/use-static-data';
import { SpriteImg, type SpriteImgProps } from './sprite-img';

type SpeciesImgProps = {
    species: number;
    generation: number;
    form: number;
    isFemale?: boolean;
    isShiny?: boolean;
    isEgg?: boolean;
    isShadow?: boolean;
    small?: boolean;
} & Omit<SpriteImgProps, 'spriteInfos' | 'size'>;

export const SpeciesImg: React.FC<SpeciesImgProps> = ({ species, generation, form, isFemale, isShiny, isEgg, isShadow, small, ...imgProps }) => {
    const staticData = useStaticData();

    const staticForms = staticData.species[ species ]?.forms[ generation ];

    if (!staticForms?.[ form ]) {
        console.log('UNKNOWN FORM -', species, generation, form);
    }

    const staticForm = staticForms?.[ form ] ?? staticForms?.[ 0 ];
    if (!staticForm) {
        return null;
    }

    const { name, spriteDefault, spriteFemale, spriteShiny, spriteShinyFemale } = staticForm;

    const getSpriteUrl = (): string | null => {
        if (isEgg) {
            return staticData.eggSprite;
        }

        if (isShiny) {
            return isFemale ? spriteShinyFemale ?? spriteShiny : spriteShiny;
        }

        return isFemale ? spriteFemale ?? spriteDefault : spriteDefault;
    };

    const spriteKey = getSpriteUrl();
    const spriteInfos = typeof spriteKey === 'string' ? staticData.spritesheets.species[ spriteKey ] : undefined;
    if (!spriteInfos) {
        console.log('No sprite -', name, species, generation, form, staticForms);
    }

    return spriteInfos && <SpriteImg
        spriteInfos={spriteInfos}
        size={small ? 48 : 96}
        className={cx(css({
            filter: isShadow ? 'drop-shadow(#770044 0px 0px 6px)' : undefined,
        }), imgProps.className)}
        data-speciesid={species}
        {...imgProps}
    />;
};
