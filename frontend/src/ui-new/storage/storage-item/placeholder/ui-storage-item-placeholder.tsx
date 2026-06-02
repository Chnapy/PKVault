import { Box, Button, Group, Tooltip } from '@mantine/core';
import type React from 'react';
import { UISpeciesImg } from '../../../sprite-img/species-img/ui-species-img';

export type UIStorageItemPlaceholderProps = Pick<Button.Props, 'loading' | 'disabled'>
    & Omit<React.ComponentProps<'button'>, 'slot'>
    & {
        label?: React.ReactNode;
    };

export const UIStorageItemPlaceholder: React.FC<UIStorageItemPlaceholderProps> = ({
    label,
    ...buttonProps
}) => {

    return <Box>
        <Tooltip
            position="bottom"
            withArrow
            disabled={!label}
            label={<Group fz='md' gap='sm' px='sm'>
                {label}
            </Group>}
        >
            <Button
                variant='light'
                p={0}
                bd='none'
                h='auto'
                style={{ boxShadow: 'none' }}
                {...buttonProps}
            >
                <UISpeciesImg
                    sheetUrl=''
                    species={0}
                    spriteInfos={{
                        height: 96,
                        width: 96,
                        x: 0,
                        y: 0,
                    }}
                />
            </Button>
        </Tooltip>
    </Box>
};
