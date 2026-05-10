import { clsx } from 'clsx';
import type React from 'react';
import { UISpriteImg, type UISpriteImgProps } from '../ui-sprite-img';
import classes from './ui-species-img.module.css';

type UISpeciesImgProps = {
    species: number;
    isShadow?: boolean;
} & UISpriteImgProps;

export const UISpeciesImg: React.FC<UISpeciesImgProps> = ({ species, isShadow, className, ...imgProps }) => {
    const disabled = species === 0;
    if (disabled) {
        species = 1;
    }

    return <UISpriteImg
        data-speciesid={species}
        className={clsx(
            classes.uiSpeciesImg,
            isShadow && classes.shadow,
            className
        )}
        disabled={disabled}
        {...imgProps}
    />;
};
