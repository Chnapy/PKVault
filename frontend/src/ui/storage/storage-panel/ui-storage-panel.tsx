import { Box, Card, type CardProps } from '@mantine/core';
import React from 'react';
import { useStorageMode } from '../../inventory/context/storage-mode-context';
import { getScrollPadding } from '../../scrollbar-width/util/get-scroll-padding';
import { UICardSectionControl } from './card-section-control/ui-card-section-control';

export type UIStoragePanelProps = {
    gameTabs: React.ReactNode;
    header: React.ReactNode;
    children: React.ReactNode;
    footer: React.ReactNode;
    backgroundImageUrl?: string;
} & CardProps;

export const UIStoragePanel: React.FC<UIStoragePanelProps> = ({ gameTabs, header, children, footer, backgroundImageUrl, ...rest }) => {
    const storageMode = useStorageMode().state;

    return <Card
        withBorder
        h='100%'
        style={{
            flexGrow: 1,
            borderColor: storageMode === 'inventory'
                ? 'var(--mantine-color-violet-4)'
                : undefined,
        }}
        {...rest}
    >
        <Card.Section component={UICardSectionControl} mah='100%' style={{ flexShrink: 1, overflowY: 'auto' }}>
            {gameTabs}
        </Card.Section>

        {header && <Box my='sm' mah='100%' style={{ flexShrink: 0, overflowY: 'auto' }}>
            {header}
        </Box>}

        {children && <Card.Section inheritPadding py='md' withBorder style={{
            flexGrow: 1,
            flexShrink: 999,
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollbarGutter: 'stable',
            paddingRight: getScrollPadding('md'),
            backgroundImage: backgroundImageUrl && `url("${backgroundImageUrl}")`,
        }}>
            {children}
        </Card.Section>}

        {footer && <Card.Section component={UICardSectionControl} inheritPadding>
            {footer}
        </Card.Section>}
    </Card>;
};
