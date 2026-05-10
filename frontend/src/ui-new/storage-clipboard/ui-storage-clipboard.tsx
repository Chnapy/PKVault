import { Card, Stack, Text } from '@mantine/core';
import type React from 'react';
import { UISpriteSizeWrapper } from '../sprite-img/ui-sprite-size-wrapper';

type UIStorageClipboardProps = {
    children: React.ReactNode;
};

export const UIStorageClipboard: React.FC<UIStorageClipboardProps> = ({ children }) => {
    return <Card
        p='sm'
        mah='100%'
        style={{ flexGrow: 1, overflowY: 'auto' }}
    >
        <Text mx='auto'>
            Clipboard
        </Text>

        <UISpriteSizeWrapper<typeof Stack>
            speciesSize='sm'
            component={Stack}
            gap='sm'
            mx='auto'
        >
            {children}
        </UISpriteSizeWrapper>
    </Card>;
};
