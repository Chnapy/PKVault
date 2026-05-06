import type React from 'react';
import { css, cx } from '@emotion/css';
import { Box, Button, Checkbox, Tooltip } from '@mantine/core';

export type UIStorageItemProps = {
    label: string;
    checked?: boolean;
    onCheck?: () => void;
    icons: React.ReactNode;
    children: React.ReactNode;
};

export const UIStorageItem: React.FC<UIStorageItemProps> = ({ label, checked = false, onCheck, icons, children }) => {

    return <Box
        className={css({
            position: 'relative',

            '&:hover > .checkbox': {
                opacity: 1,
            },
        })}
    >
        <Tooltip label={label} withArrow position="bottom" py={2}>
            <Button
                className={css({
                    position: 'relative',
                    height: 'auto',
                    padding: 0,
                })}
                variant='light'
            >
                {children}
                <Box
                    className={css({
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        padding: 4,
                    })}
                >
                    {icons}
                </Box>
            </Button>
        </Tooltip>

        <Checkbox
            className={cx(css({
                position: 'absolute',
                left: 4,
                top: 4,
                opacity: checked ? undefined : 0,
            }), 'checkbox')}
            size='sm'
            checked={checked}
            onClick={onCheck}
        />
    </Box>
};
