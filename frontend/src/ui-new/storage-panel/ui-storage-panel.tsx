import { Box, Card, Group, Stack, useMantineColorScheme } from '@mantine/core';
import type React from 'react';
import { SizingUtil } from '../../ui/util/sizing-util';

export type UIStoragePanelProps = {
    gameTabs: React.ReactNode;
    header: React.ReactNode;
    children: React.ReactNode;
    footer: React.ReactNode;
};

export const UIStoragePanel: React.FC<UIStoragePanelProps> = ({ gameTabs, header, children, footer }) => {
    const isLight = useMantineColorScheme().colorScheme === 'light';

    return <Stack gap={0} mah='100%'>

        <Card shadow='sm' withBorder>

            <Card.Section mb='xs'
                bg={isLight ? 'white.6' : 'dark.7'}
            >
                {gameTabs}
            </Card.Section>

            <Box mb='xs'>
                {header}
            </Box>

            <Card.Section inheritPadding py='xs' withBorder style={{ overflow: 'auto' }}>
                <Group gap={SizingUtil.itemsGap} wrap='wrap' miw={(SizingUtil.itemFullSize + SizingUtil.itemsGap) * 5 - SizingUtil.itemsGap}>
                    {children}
                </Group>
            </Card.Section>

            <Card.Section inheritPadding
                bg={isLight ? 'white.6' : 'dark.7'}
            >
                {footer}
            </Card.Section>
        </Card>
    </Stack>;
};
