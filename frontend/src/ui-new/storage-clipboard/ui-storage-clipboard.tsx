import { Card, Stack, Text } from '@mantine/core';
import type React from 'react';
import { SizingUtil } from '../util/sizing-util';

type UIStorageClipboardProps = {
    children: React.ReactNode;
};

export const UIStorageClipboard: React.FC<UIStorageClipboardProps> = ({ children }) => {
    return <Card p='xs' mah='100%' style={{ overflowY: 'auto' }}>
        <Text size='md' mx='auto'>
            Clipboard
        </Text>

        <Stack gap={SizingUtil.itemsGap / 2} mx='auto'>
            {children}
        </Stack>
    </Card>;
};
