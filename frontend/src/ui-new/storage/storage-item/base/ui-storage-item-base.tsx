import { Button, Group, Tooltip, type ElementProps } from '@mantine/core';
import type React from 'react';
import classes from './ui-storage-item-base.module.css';
import clsx from 'clsx';

export type UIStorageItemBaseProps =
    & Button.Props
    & ElementProps<'button'>
    & {
        label?: React.ReactNode;
    };

export const UIStorageItemBase: React.FC<UIStorageItemBaseProps> = ({
    className,
    label,
    children,
    ...buttonProps
}) => {
    return (
        <Tooltip
            position="bottom"
            withArrow
            disabled={!label}
            label={<Group fz='md' gap='sm' px='sm'>
                {label}
            </Group>}
        >
            <Button
                className={clsx(classes.uiStorageItemBase, className)}
                variant='light'
                {...buttonProps}
            >
                {children}
            </Button>
        </Tooltip>
    );
};
