import { clsx } from 'clsx';
import type React from 'react';
import { UISpriteImg, type UISpriteImgProps } from '../ui-sprite-img';
import classes from './ui-item-img.module.css';

export type UIItemImgProps = {
    item: number | string;  // value or id
} & UISpriteImgProps;

export const UIItemImg: React.FC<UIItemImgProps> = ({ item, className, ...imgProps }) => {
    return <UISpriteImg
        data-itemid={item}
        className={clsx(
            classes.uiItemImg,
            className
        )}
        {...imgProps}
    />;
};
