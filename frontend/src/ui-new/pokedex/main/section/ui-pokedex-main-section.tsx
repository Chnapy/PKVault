import { Group } from '@mantine/core';
import type React from 'react';

type UIPokedexMainSectionProps = {
    children: React.ReactNode;
};

export const UIPokedexMainSection: React.FC<UIPokedexMainSectionProps> = ({ children }) => {
    return <Group gap='sm' py='md'>
        {children}
    </Group>;
};
