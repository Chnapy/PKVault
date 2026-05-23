import { Box, Button, Checkbox, Tooltip, type BoxProps, type ElementProps } from '@mantine/core';
import type React from 'react';
import classes from './ui-storage-item.module.css';

export type UIStorageItemProps = Pick<Button.Props, 'loading' | 'disabled'>
    & Pick<ElementProps<'button'>, 'ref' | 'onClick' | 'onPointerDown' | 'onPointerUp' | 'children'>
    & {
        label: string;
        checked?: boolean;
        onCheck?: () => void;
        icons: React.ReactNode;
        dragging?: boolean;
    } & BoxProps;

export const UIStorageItem: React.FC<UIStorageItemProps> = ({
    ref, label, onClick, onPointerDown, onPointerUp,
    checked = false, onCheck,
    icons, loading, disabled, dragging,
    children, ...rest
}) => {

    const button = <Button
        ref={ref}
        variant='light'
        className={classes.button}
        onClick={onClick}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        loading={loading}
        disabled={disabled}
        bd='none'
        opacity={dragging ? 0.75 : undefined}
    >
        {children}
        <Box className={classes.icons}>
            {icons}
        </Box>
    </Button>;


    return <Box
        className={classes.uiStorageItem}
        {...rest}
    >
        {dragging
            ? button
            : <Tooltip label={label} withArrow position="bottom">
                {button}
            </Tooltip>}

        {!loading && !disabled && !dragging && <Checkbox
            className={classes.checkbox}
            size='sm'
            checked={checked}
            onClick={onCheck}
        />}
    </Box>
};
