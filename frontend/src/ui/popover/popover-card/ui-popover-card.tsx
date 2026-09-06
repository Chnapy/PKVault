import { Card, Group, Stack, Text, type PolymorphicComponentProps } from '@mantine/core';
import type React from 'react';
import { UICardSectionControl } from '../../storage/storage-panel/card-section-control/ui-card-section-control';

type UIPopoverCardInnerProps = {
    icon?: React.ReactNode;
    title: React.ReactNode;
    description?: React.ReactNode;
    footer?: React.ReactNode;
    children: React.ReactNode;
};

export type UIPopoverCardProps<C> =
    & UIPopoverCardInnerProps
    & Omit<PolymorphicComponentProps<C, Card.Props>, 'component' | keyof UIPopoverCardInnerProps>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    & { component?: any };

export const UIPopoverCard = function <C>({
    icon, title, description, footer, children,
    ...cardProps
}: UIPopoverCardProps<C>) {
    return <Card
        {...cardProps as object}
        style={{
            position: 'initial',
            overflow: 'initial',
            ...cardProps.style,
        }}
    >
        <Card.Section component={UICardSectionControl} inheritPadding withBorder py='sm'>
            <Group gap='sm'>
                {icon}
                <Text size='lg'>
                    {title}
                </Text>
            </Group>
            {description
                ? <Text c='dimmed' lh={1.1}>
                    {description}
                </Text>
                : null}
        </Card.Section>
        <Card.Section inheritPadding withBorder py='md' mih={0} mah='100%'>
            <Stack mih={0} mah='100%'>
                {children}
            </Stack>
        </Card.Section>
        {footer && <Card.Section component={UICardSectionControl} inheritPadding withBorder py='md'>
            {footer}
        </Card.Section>}
    </Card>;
};
