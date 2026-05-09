import { Box, Card, Group, useMantineColorScheme, type CardProps } from '@mantine/core';
import type React from 'react';
import { SizingUtil } from '../util/sizing-util';

export type UIStoragePanelProps = {
    gameTabs: React.ReactNode;
    header: React.ReactNode;
    children: React.ReactNode;
    footer: React.ReactNode;
} & CardProps;

export const UIStoragePanel: React.FC<UIStoragePanelProps> = ({ gameTabs, header, children, footer, ...rest }) => {
    const isLight = useMantineColorScheme().colorScheme === 'light';

    return <Card withBorder mah='100%' {...rest}>
        <Card.Section mb='md'
            bg={isLight ? 'white.6' : 'dark.7'}
        >
            {gameTabs}
        </Card.Section>

        <Box mb='md'>
            {header}
        </Box>

        <Card.Section inheritPadding py='md' withBorder style={{ overflow: 'auto' }}>
            <Group gap={SizingUtil.itemsGap} wrap='wrap' miw={(SizingUtil.itemFullSize + SizingUtil.itemsGap) * 5 - SizingUtil.itemsGap}>
                {children}
            </Group>
        </Card.Section>

        <Card.Section inheritPadding
            bg={isLight ? 'white.6' : 'dark.7'}
        >
            {footer}
        </Card.Section>
    </Card>;
};
