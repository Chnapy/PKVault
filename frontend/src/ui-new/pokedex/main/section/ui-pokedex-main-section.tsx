import { Group } from '@mantine/core';
import React from 'react';
import { VisibilityObserver } from '../../../visibility/visibility-observer';

type UIPokedexMainSectionProps = {
    children: React.ReactNode;
};

export const UIPokedexMainSection: React.FC<UIPokedexMainSectionProps> = ({ children }) => {
    const ref = React.useRef<HTMLDivElement>(null);

    return <Group ref={ref} gap='sm' py='md'>
        <VisibilityObserver ref={ref} margin='600px'>
            {children}
        </VisibilityObserver>
    </Group>;
};
