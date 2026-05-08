import { clsx } from 'clsx';
import type React from 'react';
import { SizingUtil } from '../util/sizing-util';
import { UISpriteImg, type UISpriteImgProps } from './ui-sprite-img';
import classes from './ui-sprite-img.module.css';
import { switchUtil } from '../../util/switch-util';

type UISpeciesImgProps = {
    species: number;
    isShadow?: boolean;
    size?: 'small' | 'medium' | 'big';
} & Omit<UISpriteImgProps, 'size'>;

export const UISpeciesImg: React.FC<UISpeciesImgProps> = ({ spriteInfos, species, isShadow, size = 'medium', className, ...imgProps }) => {
    const disabled = species === 0;
    if (disabled) {
        species = 1;
    }

    return spriteInfos && <UISpriteImg
        spriteInfos={spriteInfos}
        size={switchUtil(size, {
            small: SizingUtil.itemSize / 2,
            medium: SizingUtil.itemSize,
            big: SizingUtil.itemSize * 2,
        })}
        className={clsx(
            isShadow && classes.shadow,
            size === 'big' && classes.big,
            className
        )}
        data-speciesid={species}
        disabled={disabled}
        {...imgProps}
    />;
};
