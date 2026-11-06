import { Badge, Divider, Group, ThemeIcon } from '@mantine/core';
import { ListIcon } from 'lucide-react';
import type React from 'react';
import { UIPokedexIcons } from '../../icons/ui-pokedex-icons';

type UIPokedexMainSectionHeaderProps = {
    generation: string;
    regions: string[];
    games: React.ReactNode;
    seenCount: number;
    caughtCount: number;
    ownedCount: number;
    shinyCount: number;
    totalCount: number;
    showLivingDex?: boolean;
    ownedLabel?: string;
};

export const UIPokedexMainSectionHeader: React.FC<UIPokedexMainSectionHeaderProps> = ({
    generation, regions, games, seenCount, caughtCount, ownedCount, shinyCount, totalCount, showLivingDex, ownedLabel
}) => {
    const renderCount = (icon: React.ReactNode, count: number) => <Badge variant='default' leftSection={icon} fz='md' px='sm'>
        {count}
    </Badge>;

    return <Group justify='space-between' py='sm' wrap='nowrap' style={{ overflow: 'hidden' }}>
        <Group wrap='nowrap' style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
            {generation}
            {regions.map(region => <Badge key={region} variant='default' visibleFrom='sm'>{region}</Badge>)}
            <Divider orientation='vertical' />
            {games}
        </Group>

        <Group pr='md' wrap='nowrap'>
            {renderCount(<UIPokedexIcons.Seen size='sm' />, seenCount)}
            {renderCount(<UIPokedexIcons.Caught size='sm' />, caughtCount)}
            {showLivingDex
                ? <Badge variant='default' leftSection={<UIPokedexIcons.Owned size='sm' />} fz='md' px='sm'>
                    {ownedCount} / {totalCount} {ownedLabel}
                </Badge>
                : renderCount(<UIPokedexIcons.Owned size='sm' />, ownedCount)}
            {renderCount(<UIPokedexIcons.Shiny size='sm' />, shinyCount)}
            {!showLivingDex && <>
                <Divider orientation='vertical' />
                {renderCount(<ThemeIcon variant='transparent' size='sm'>
                    <ListIcon />
                </ThemeIcon>, totalCount)}
            </>}
        </Group>
    </Group>;
};
