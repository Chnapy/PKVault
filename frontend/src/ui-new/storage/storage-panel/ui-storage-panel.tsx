import { Box, Card, type CardProps } from '@mantine/core';
import React from 'react';
import { UICardSectionControl } from './card-section-control/ui-card-section-control';

export type UIStoragePanelProps = {
    gameTabs: React.ReactNode;
    header: React.ReactNode;
    children: React.ReactNode;
    footer: React.ReactNode;
    backgroundImageUrl?: string;
} & CardProps;

export const UIStoragePanel: React.FC<UIStoragePanelProps> = ({ gameTabs, header, children, footer, backgroundImageUrl, ...rest }) => {

    return <Card
        withBorder
        h='100%'
        style={{ flexGrow: 1 }}
        {...rest}
    >
        <Card.Section component={UICardSectionControl} mah='100%' style={{ flexShrink: 0, overflowY: 'auto' }}>
            {gameTabs}
        </Card.Section>

        {header && <Box my='sm' mah='100%' style={{ flexShrink: 0, overflowY: 'auto' }}>
            {header}
        </Box>}

        {children && <Card.Section inheritPadding py='md' withBorder style={{
            flexGrow: 1,
            flexShrink: 999,
            overflowY: 'scroll',
            paddingRight: 0,
            backgroundImage: backgroundImageUrl && `url("${backgroundImageUrl}")`,
        }}>
            {children}
        </Card.Section>}

        {footer && <Card.Section component={UICardSectionControl} inheritPadding>
            {footer}
        </Card.Section>}
    </Card>;
};
