import { Box, Button } from '@mantine/core';
import type React from 'react';

export type UIStorageItemPlaceholderProps = {
};

export const UIStorageItemPlaceholder: React.FC<UIStorageItemPlaceholderProps> = ({ }) => {

    return <Box>
        <Button
            variant='light'
            p={0}
            w='var(--storage-item-sprite-size)'
            h='var(--storage-item-sprite-size)'
        >
        </Button>
    </Box>
};
