import { Box, Card, Group, type CardProps } from '@mantine/core';
import React from 'react';
import { UICardSectionControl } from './card-section-control/ui-card-section-control';

export type UIStoragePanelProps = {
    gameTabs: React.ReactNode;
    header: React.ReactNode;
    children: React.ReactNode;
    footer: React.ReactNode;
} & CardProps;

export const UIStoragePanel: React.FC<UIStoragePanelProps> = ({ gameTabs, header, children, footer, ...rest }) => {
    const childrenCount = React.Children.count(children);

    const getCols = () => {
        switch (childrenCount) {
            case 30:
                return 6;
            case 25:
                return 5;
            case 20:
                return 4;
        }
    };

    const cols = getCols();

    return <Card
        withBorder
        mah='100%'
        style={{ flexGrow: 1 }}
        {...rest}
    >
        <Card.Section component={UICardSectionControl} mb='md'>
            {gameTabs}
        </Card.Section>

        <Box mb='md'>
            {header}
        </Box>

        <Card.Section inheritPadding py='md' withBorder style={{ flexGrow: 1, overflow: 'auto' }}>
            <Group
                maw={cols
                    ? `calc(${cols} * (var(--storage-item-size) + var(--group-gap)) - var(--group-gap))`
                    : undefined}
                gap='sm'
                wrap='wrap'
                mx='auto'
            >
                {children}
            </Group>
        </Card.Section>

        <Card.Section component={UICardSectionControl} inheritPadding>
            {footer}
        </Card.Section>
    </Card>;
};
