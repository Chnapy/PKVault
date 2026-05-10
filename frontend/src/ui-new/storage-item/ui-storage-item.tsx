import { Box, Button, Checkbox, Tooltip, type BoxProps } from '@mantine/core';
import type React from 'react';
import classes from './ui-storage-item.module.css';

export type UIStorageItemProps = {
    label: string;
    checked?: boolean;
    onCheck?: () => void;
    icons: React.ReactNode;
    children: React.ReactNode;
} & BoxProps;

export const UIStorageItem: React.FC<UIStorageItemProps> = ({ label, checked = false, onCheck, icons, children, ...rest }) => {

    return <Box className={classes.uiStorageItem} {...rest}>
        <Tooltip label={label} withArrow position="bottom">
            <Button
                variant='light'
                className={classes.button}
                bd='none'
            >
                {children}
                <Box className={classes.icons}>
                    {icons}
                </Box>
            </Button>
        </Tooltip>

        <Checkbox
            className={classes.checkbox}
            // style={{ opacity: checked ? undefined : 0 }}
            size='sm'
            checked={checked}
            onClick={onCheck}
        />
    </Box>
};
