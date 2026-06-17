import { Card, CloseButton } from '@mantine/core';
import React from 'react';
import { UICardSectionControl } from '../storage-panel/card-section-control/ui-card-section-control';

export type UIStorageDetailsProps = {
    header: (closeBtn: React.ReactNode) => React.ReactNode;
    main: React.ReactNode;
    content: React.ReactNode;
    actions: React.ReactNode;
    onClose: () => void;
};

export const UIStorageDetails: React.FC<UIStorageDetailsProps> = ({
    header, main, content, actions, onClose
}) => {

    return <Card>
        <Card.Section component={UICardSectionControl} p={0}>
            {header(
                <CloseButton onClick={onClose} />
            )}
        </Card.Section>

        <Card.Section inheritPadding py='inherit'>
            {main}
        </Card.Section>

        <Card.Section withBorder mih={0}>
            {content}
        </Card.Section>

        <Card.Section component={UICardSectionControl} inheritPadding py='inherit' withBorder>
            {actions}
        </Card.Section>
    </Card>;
};
