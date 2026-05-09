import { Box, Card, Group, type CardProps } from '@mantine/core';
import type React from 'react';
import { SizingUtil } from '../util/sizing-util';
import { UICardSectionControl } from './card-section-control/ui-card-section-control';

export type UIStoragePanelProps = {
    gameTabs: React.ReactNode;
    header: React.ReactNode;
    children: React.ReactNode;
    footer: React.ReactNode;
} & CardProps;

export const UIStoragePanel: React.FC<UIStoragePanelProps> = ({ gameTabs, header, children, footer, ...rest }) => {
    return <Card withBorder mah='100%' {...rest}>
        <Card.Section component={UICardSectionControl} mb='md'>
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

        <Card.Section component={UICardSectionControl} inheritPadding>
            {footer}
        </Card.Section>
    </Card>;
};
