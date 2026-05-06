import { clsx } from 'clsx';
import type React from 'react';
import { SizingUtil } from '../util/sizing-util';
import { UISpriteImg, type UISpriteImgProps } from './ui-sprite-img';
import classes from './ui-sprite-img.module.css';

type UISpeciesImgProps = {
    species: number;
    isShadow?: boolean;
    small?: boolean;
} & Omit<UISpriteImgProps, 'size'>;

export const UISpeciesImg: React.FC<UISpeciesImgProps> = ({ spriteInfos, species, isShadow, small, ...imgProps }) => {
    const disabled = species === 0;
    if (disabled) {
        species = 1;
    }

    return spriteInfos && <UISpriteImg
        spriteInfos={spriteInfos}
        size={small ? SizingUtil.itemSize / 2 : SizingUtil.itemSize}
        className={clsx(
            isShadow && classes.shadow,
            imgProps.className
        )}
        data-speciesid={species}
        disabled={disabled}
        {...imgProps}
    />;
};
