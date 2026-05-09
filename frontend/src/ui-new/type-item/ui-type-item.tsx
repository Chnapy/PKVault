import { Badge, type BadgeProps } from '@mantine/core';
import { clsx } from 'clsx';
import type React from 'react';
import classes from './ui-type-item.module.css';
import { getTypeImg } from './util/get-type-img';

export type UITypeItemProps = {
    type: number;
    name?: string;
    clickable?: boolean;
    isNone?: boolean;
    alpha?: React.ReactNode;
}
    & BadgeProps;

export const UITypeItem: React.FC<UITypeItemProps> = ({ type, name, clickable, isNone, alpha, ...rest }) => {
    const typeImg = getTypeImg(type);

    return <Badge
        data-mantine-color-scheme="light"
        variant='filled'
        radius='sm'
        color={typeImg.color}
        // autoContrast
        leftSection={
            <img
                className={classes.icon}
                src={typeImg.img}
            />
        }
        classNames={{
            root: clsx(
                classes.uiTypeItem,
                isNone && classes.none,
                clickable && classes.clickable,
            ),
            label: classes.label,
        }}
        {...rest}
    >
        {alpha}

        {name}

        {rest.children}
    </Badge>;
};
