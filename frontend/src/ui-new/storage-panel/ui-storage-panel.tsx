import { Box, Card, Group, type CardProps } from '@mantine/core';
import React from 'react';
import { UICardSectionControl } from './card-section-control/ui-card-section-control';
import { getBoxColumns } from './get-box-columns';

export type UIStoragePanelProps = {
    gameTabs: React.ReactNode;
    header: React.ReactNode;
    children: React.ReactNode;
    footer: React.ReactNode;
} & CardProps;

export const UIStoragePanel: React.FC<UIStoragePanelProps> = ({ gameTabs, header, children, footer, ...rest }) => {
    const childrenCount = React.Children.count(children);

    const cols = getBoxColumns(childrenCount);

    return <Card
        withBorder
        mah='100%'
        style={{ flexGrow: 1 }}
        {...rest}
    >
        <Card.Section component={UICardSectionControl} mah='100%' style={{ overflowY: 'auto' }}>
            {gameTabs}
        </Card.Section>

        <Box my='sm' mah='100%' style={{ overflowY: 'auto' }}>
            {header}
        </Box>

        <Card.Section inheritPadding py='md' withBorder style={{ flexGrow: 1, flexShrink: 999, overflow: 'auto' }}>
            <Group
                gap='sm'
                wrap='wrap'
                mx='auto'
                style={cols
                    ? {
                        display: 'grid',
                        gridTemplateColumns: `repeat(${cols}, 1fr)`,
                        width: 'fit-content',
                    }
                    : undefined}
            >
                {children}
            </Group>
        </Card.Section>

        <Card.Section component={UICardSectionControl} inheritPadding>
            {footer}
        </Card.Section>
    </Card>;
};
