import { ActionIcon, Card, CloseButton, Group } from '@mantine/core';
import { Maximize2Icon, Minimize2Icon } from 'lucide-react';
import React from 'react';
import { UICardSectionControl } from '../storage-panel/card-section-control/ui-card-section-control';

export type UIStorageDetailsProps = {
    expanded: boolean;
    header: (closeBtn: React.ReactNode) => React.ReactNode;
    main: React.ReactNode;
    content: React.ReactNode;
    actions: React.ReactNode;
    onExpand?: () => void;
    onClose: () => void;
};

export const UIStorageDetails: React.FC<UIStorageDetailsProps> = ({
    expanded, header, main, content, actions, onExpand, onClose
}) => {

    return <Card mih={0} style={{
        position: 'initial',
        overflow: 'initial',
    }}>
        <Card.Section component={UICardSectionControl} p={0}>
            {header(<>
                {onExpand && <ActionIcon variant='subtle' onClick={onExpand}>
                    {expanded
                        ? <Minimize2Icon />
                        : <Maximize2Icon />}
                </ActionIcon>}

                <CloseButton onClick={onClose} />
            </>)}
        </Card.Section>

        {!expanded && <Card.Section inheritPadding py='inherit'>
            {main}
        </Card.Section>}

        {!expanded && <Card.Section withBorder mih={0}>
            {content}
        </Card.Section>}

        {expanded && <Card.Section inheritPadding py='inherit' withBorder style={{ overflow: 'auto' }}>
            <Group align='stretch'>
                {main}
                {content}
            </Group>
        </Card.Section>}

        <Card.Section component={UICardSectionControl} inheritPadding py='inherit' withBorder>
            {actions}
        </Card.Section>
    </Card>;
};
