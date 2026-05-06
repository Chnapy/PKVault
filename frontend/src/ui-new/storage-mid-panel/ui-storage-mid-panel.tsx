import { Button, Card, Stack, Text, ThemeIcon } from '@mantine/core';
import type React from 'react';
import { SortHorizontal } from 'pixelarticons/react';

type UIStorageMidPanelProps = {};

export const UIStorageMidPanel: React.FC<UIStorageMidPanelProps> = () => {

    return <Stack>
        <Card p='xs'>
            <Button leftSection={<ThemeIcon variant='transparent' size='xs'> <SortHorizontal /></ThemeIcon>} size='compact-sm'>
                Swap
            </Button>
        </Card>

        <Card p='xs'>
            <Text size='md' mx='auto'>
                Clipboard
            </Text>


        </Card>
    </Stack>;
};
