import { Card, CardSection } from '@mantine/core';
import type React from 'react';

export type UIStorageDetailsProps = {
    header: React.ReactNode;
    main: React.ReactNode;
    content: React.ReactNode;
};

export const UIStorageDetails: React.FC<UIStorageDetailsProps> = ({
    header, main, content,
}) => {

    return <Card>
        {header && <CardSection p={0}>
            {header}
        </CardSection>}

        <CardSection inheritPadding py='inherit'>
            {main}
        </CardSection>

        <CardSection withBorder>
            {content}
        </CardSection>
    </Card>;
};
