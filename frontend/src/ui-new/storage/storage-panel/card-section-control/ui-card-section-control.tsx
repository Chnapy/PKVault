import { Card, type CardSectionProps } from '@mantine/core';
import type React from 'react';
import classes from './ui-card-section-control.module.css';

export const UICardSectionControl: React.FC<{ children: React.ReactNode } & CardSectionProps> = (props) => {
    return <Card.Section
        classNames={{
            section: classes.uiCardSectionControl,
        }}
        {...props}
    />;
};
