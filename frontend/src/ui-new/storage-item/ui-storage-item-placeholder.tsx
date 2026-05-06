import { css } from '@emotion/css';
import { Box, Button } from '@mantine/core';
import type React from 'react';
import { SizingUtil } from '../../ui/util/sizing-util';

export type UIStorageItemPlaceholderProps = {
    small?: boolean;
};

export const UIStorageItemPlaceholder: React.FC<UIStorageItemPlaceholderProps> = ({ small }) => {

    const size = small ? SizingUtil.itemSize / 2 : SizingUtil.itemSize;

    return <Box>
        <Button
            className={css({
                height: size,
                width: size,
                padding: 0,
                // borderStyle: 'dashed',
                // backgroundColor: 'transparent',
            })}
            variant='light'
        >
        </Button>
    </Box>
};
