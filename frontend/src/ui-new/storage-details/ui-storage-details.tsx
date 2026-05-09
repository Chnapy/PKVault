import { Card, CardSection, CloseButton, Flex, Group } from '@mantine/core';
import type React from 'react';

export type UIStorageDetailsProps = {
    header: React.ReactNode;
    main: React.ReactNode;
    content: React.ReactNode;
    actions: React.ReactNode;
    onClose: () => void;
};

export const UIStorageDetails: React.FC<UIStorageDetailsProps> = ({
    header, main, content, actions, onClose,
}) => {

    return <Card>
        <CardSection p={0}>
            <Flex>
                {header}
                <CloseButton onClick={onClose} />
            </Flex>
        </CardSection>

        <CardSection inheritPadding py='inherit'>
            {main}
        </CardSection>

        <CardSection withBorder>
            {content}
        </CardSection>

        <CardSection inheritPadding py='inherit' withBorder>
            <Group>
                {actions}
            </Group>
        </CardSection>
    </Card>;
};
