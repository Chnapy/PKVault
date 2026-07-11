import { Badge, Box, Divider, Group } from '@mantine/core';
import { EyeIcon, FolderIcon, ListIcon } from 'lucide-react';
import type React from 'react';
import { UIBallIcon } from '../../../icon/ui-ball-icon';
import { UIShinyIcon } from '../../../icon/ui-shiny-icon';

type UIPokedexMainSectionHeaderProps = {
    generation: string;
    regions: string[];
    games: React.ReactNode;
    seenCount: number;
    caughtCount: number;
    ownedCount: number;
    shinyCount: number;
    totalCount: number;
};

export const UIPokedexMainSectionHeader: React.FC<UIPokedexMainSectionHeaderProps> = ({
    generation, regions, games, seenCount, caughtCount, ownedCount, shinyCount, totalCount
}) => {
    const renderCount = (icon: React.ReactNode, count: number) => <Badge variant='default' leftSection={icon} fz='md' px='sm'>
        <Box pl='sm'>
            {count}
        </Box>
    </Badge>;

    return <Group justify='space-between' py='sm'>
        <Group>
            {generation}
            {regions.map(region => <Badge key={region} variant='default'>{region}</Badge>)}
            <Divider orientation='vertical' />
            {games}
        </Group>

        <Group>
            {renderCount(<EyeIcon />, seenCount)}
            {renderCount(<UIBallIcon />, caughtCount)}
            {renderCount(<FolderIcon />, ownedCount)}
            {renderCount(<UIShinyIcon />, shinyCount)}
            <Divider orientation='vertical' />
            {renderCount(<ListIcon />, totalCount)}
        </Group>
    </Group>;
};
