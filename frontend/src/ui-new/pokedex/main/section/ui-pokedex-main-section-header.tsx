import { Badge, Divider, Group } from '@mantine/core';
import { EyeIcon, FolderIcon, ListIcon } from 'lucide-react';
import type React from 'react';
import { UIBallIcon } from '../../../icon/ui-ball-icon';
import { UIShinyIcon } from '../../../icon/ui-shiny-icon';

type UIPokedexMainSectionHeaderProps = {
    generation: string;
    regions: string[];
    seenCount: number;
    caughtCount: number;
    ownedCount: number;
    shinyCount: number;
    totalCount: number;
};

export const UIPokedexMainSectionHeader: React.FC<UIPokedexMainSectionHeaderProps> = ({
    generation, regions, seenCount, caughtCount, ownedCount, shinyCount, totalCount
}) => {
    return <Group justify='space-between' py='sm'>
        <Group>
            {generation}
            {regions.map(region => <Badge key={region} variant='default'>{region}</Badge>)}
        </Group>

        <Group>
            <Badge variant='default' leftSection={<EyeIcon />} fz='md'>{seenCount}</Badge>
            <Badge variant='default' leftSection={<UIBallIcon />} fz='md'>{caughtCount}</Badge>
            <Badge variant='default' leftSection={<FolderIcon />} fz='md'>{ownedCount}</Badge>
            <Badge variant='default' leftSection={<UIShinyIcon />} fz='md'>{shinyCount}</Badge>
            <Divider orientation='vertical' />
            <Badge variant='default' leftSection={<ListIcon />} fz='md'>{totalCount}</Badge>
        </Group>
    </Group>;
};
