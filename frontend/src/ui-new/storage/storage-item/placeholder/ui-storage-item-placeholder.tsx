import { Box, Button } from '@mantine/core';
import type React from 'react';
import { UISpeciesImg } from '../../../sprite-img/species-img/ui-species-img';

export type UIStorageItemPlaceholderProps = Pick<Button.Props, 'loading' | 'disabled'>
    & React.ComponentProps<'button'>;

export const UIStorageItemPlaceholder: React.FC<UIStorageItemPlaceholderProps> = ({
    ...buttonProps
}) => {

    return <Box>
        <Button
            variant='light'
            p={0}
            bd='none'
            h='auto'
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
    </Box>
};
