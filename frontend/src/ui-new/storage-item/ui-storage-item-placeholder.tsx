import { Box, Button } from '@mantine/core';
import type React from 'react';
import { SizingUtil } from '../util/sizing-util';

export type UIStorageItemPlaceholderProps = {
    small?: boolean;
};

export const UIStorageItemPlaceholder: React.FC<UIStorageItemPlaceholderProps> = ({ small }) => {

    const size = small ? SizingUtil.itemSize / 2 : SizingUtil.itemSize;

    return <Box>
        <Button
            variant='light'
            p={0}
            style={{
                height: size,
                width: size,
            }}
        >
        </Button>
    </Box>
};
