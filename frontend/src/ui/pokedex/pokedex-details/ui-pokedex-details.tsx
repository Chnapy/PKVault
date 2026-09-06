import { ActionIcon, Card, CloseButton, Group, Stack } from '@mantine/core';
import { Maximize2Icon, Minimize2Icon } from 'lucide-react';
import React from 'react';
import { getScrollPadding } from '../../scrollbar-width/util/get-scroll-padding';
import { UICardSectionControl } from '../../storage/storage-panel/card-section-control/ui-card-section-control';

export type UIPokedexDetailsProps = {
    expanded: boolean;
    header: (closeBtn: React.ReactNode) => React.ReactNode;
    main: React.ReactNode;
    items: React.ReactNode;
    content: React.ReactNode;
    onExpand?: () => void;
    onClose: () => void;
};

export const UIPokedexDetails: React.FC<UIPokedexDetailsProps> = ({
    expanded, header, main, items, content, onExpand, onClose
}) => {

    return <Card>
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

        {!expanded && <Card.Section component={UICardSectionControl} withBorder>
            {items}
        </Card.Section>}

        {!expanded && <Card.Section withBorder mih={0}>
            {content}
        </Card.Section>}

        {expanded && <Card.Section inheritPadding py='inherit' pr={getScrollPadding('md')} withBorder style={{ overflow: 'auto', scrollbarGutter: 'stable' }}>
            <Group align='stretch'>
                <Stack gap={0}>
                    {main}
                    <UICardSectionControl m={0} w={280} maw='100%'>
                        {items}
                    </UICardSectionControl>
                </Stack>

                {content}
            </Group>
        </Card.Section>}
    </Card>;
};
