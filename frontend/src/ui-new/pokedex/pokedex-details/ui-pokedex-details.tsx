import { Card, CloseButton } from '@mantine/core';
import React from 'react';
import { UICardSectionControl } from '../../storage/storage-panel/card-section-control/ui-card-section-control';

export type UIPokedexDetailsProps = {
    header: (closeBtn: React.ReactNode) => React.ReactNode;
    main: React.ReactNode;
    items: React.ReactNode;
    content: React.ReactNode;
    onClose: () => void;
};

export const UIPokedexDetails: React.FC<UIPokedexDetailsProps> = ({
    header, main, items, content, onClose
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

        <Card.Section component={UICardSectionControl} withBorder>
            {items}
        </Card.Section>

        <Card.Section withBorder>
            {content}
        </Card.Section>
    </Card>;
};
