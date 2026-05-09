import { Card, useMantineColorScheme, type CardSectionProps } from '@mantine/core';
import type React from 'react';
import classes from './ui-card-section-control.module.css';

export const UICardSectionControl: React.FC<{ children: React.ReactNode } & CardSectionProps> = (props) => {
    const isLight = useMantineColorScheme().colorScheme === 'light';

    return <Card.Section
        bg={isLight ? 'white.6' : 'dark.7'}
        classNames={{
            section: classes.uiCardSectionControl,
        }}
        {...props}
    />;
};
