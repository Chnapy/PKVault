import { Card, CloseButton, Group, type CardProps } from '@mantine/core';
import type React from 'react';
import { UICardSectionControl } from '../storage-panel/card-section-control/ui-card-section-control';

export type UIStorageDetailsProps = {
    header: (closeBtn: React.ReactNode) => React.ReactNode;
    main: React.ReactNode;
    content: React.ReactNode;
    actions: React.ReactNode;
    onClose: () => void;
} & CardProps;

export const UIStorageDetails: React.FC<UIStorageDetailsProps> = ({
    header, main, content, actions, onClose, ...rest
}) => {

    return <Card {...rest}>
        <Card.Section component={UICardSectionControl} p={0}>
            {header(
                <CloseButton onClick={onClose} />
            )}
        </Card.Section>

        <Card.Section inheritPadding py='inherit'>
            {main}
        </Card.Section>

        <Card.Section withBorder>
            {content}
        </Card.Section>

        <Card.Section component={UICardSectionControl} inheritPadding py='inherit' withBorder>
            <Group>
                {actions}
            </Group>
        </Card.Section>
    </Card>;
};
