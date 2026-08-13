import { Group } from '@mantine/core';
import React from 'react';
import { VisibilityObserver } from '../../../visibility/visibility-observer';
import { Route } from '../../../../routes/pokedex';

type UIPokedexMainSectionProps = {
    isFirstSection: boolean;
    minSpecies: number;
    maxSpecies: number;
    children: React.ReactNode;
};

export const UIPokedexMainSection: React.FC<UIPokedexMainSectionProps> = ({ isFirstSection, minSpecies, maxSpecies, children }) => {
    const ref = React.useRef<HTMLDivElement>(null);

    const initialVisible = Route.useSearch({
        select: (search) => {
            if (search.selected) {
                return search.selected >= minSpecies && search.selected <= maxSpecies;
            }

            return isFirstSection;
        }
    });

    return <Group ref={ref} gap='sm' py='md'>
        <VisibilityObserver ref={ref} margin='600px' initialValue={initialVisible}>
            {children}
        </VisibilityObserver>
    </Group>;
};
