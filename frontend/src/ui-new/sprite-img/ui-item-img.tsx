import { clsx } from 'clsx';
import type React from 'react';
import { switchUtil } from '../../util/switch-util';
import { UISpriteImg, type UISpriteImgProps } from './ui-sprite-img';
import classes from './ui-sprite-img.module.css';

export type UIItemImgProps = {
    item: number | string;  // value or id
    size?: 'medium' | 'big' | '1lh';
} & Omit<UISpriteImgProps, 'size'>;

export const UIItemImg: React.FC<UIItemImgProps> = ({ item, size = 'medium', className, ...imgProps }) => {
    return <UISpriteImg
        data-itemid={item}
        size={switchUtil(size, {
            medium: undefined,
            big: imgProps.spriteInfos.height * 2,
            '1lh': '1lh' as const,
        })}
        className={clsx(
            size === 'big' && classes.big,
            className,
        )}
        {...imgProps}
    />;
};
