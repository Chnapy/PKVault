import { Box, Button } from '@mantine/core';
import type React from 'react';
import { UISpeciesImg } from '../../sprite-img/species-img/ui-species-img';

export type UIStorageItemPlaceholderProps = {
};

export const UIStorageItemPlaceholder: React.FC<UIStorageItemPlaceholderProps> = ({ }) => {

    return <Box>
        <Button
            variant='light'
            p={0}
            bd='none'
            h='auto'
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
