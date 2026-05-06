import { css, cx } from '@emotion/css';
import type React from 'react';
import { SizingUtil } from '../../ui/util/sizing-util';
import { UISpriteImg, type UISpriteImgProps } from './ui-sprite-img';

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
        className={cx(css({
            filter: isShadow ? 'drop-shadow(#770044 0px 0px 6px)' : undefined,
            opacity: disabled ? 0.25 : undefined,
        }), imgProps.className)}
        data-speciesid={species}
        {...imgProps}
    />;
};
