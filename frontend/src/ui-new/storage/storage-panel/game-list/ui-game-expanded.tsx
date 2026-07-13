import { Box, Divider, Group } from '@mantine/core';
import { TimerIcon } from 'lucide-react';
import type React from 'react';
import type { Gender } from '../../../../data/sdk/model';
import { UIGender } from '../../../icon/ui-gender';
import { UIPokedexIcons } from '../../../pokedex/icons/ui-pokedex-icons';
import { UIGameExpandedWrapper, type UIGameExpandedWrapperProps } from './ui-game-expanded-wrapper';

export type UIGameExpandedProps = Pick<UIGameExpandedWrapperProps, 'selected' | 'loading' | 'onSelect' | 'editDropdown' | 'actions' | 'label' | 'imgSrc' | 'path'>
    & {
        id: string;
        generation: string;
        ot: string;
        otGender: Gender;
        tid: number;
        caughtCount?: number;
        ownedCount: number;
        shinyCount?: number;
        playTime: string;
        language: string;
    };

const renderCount = (icon: React.ReactNode, count: number) => <Group component='span' wrap='nowrap' gap='sm' style={{ flexShrink: 0 }}>
    {icon} <span>{count}</span>
</Group>;

export const UIGameExpanded: React.FC<UIGameExpandedProps> = ({
    id, generation, label, ot, otGender, tid, caughtCount, ownedCount, shinyCount, playTime, language,
    ...rest
}) => {
    return <UIGameExpandedWrapper
        {...rest}
        title={id}
        label={<>
            <Box component='span' c='blue'>{generation}</Box> - {label}
        </>}
        secondaryLine={<>
            OT {ot} <UIGender gender={otGender} /> - TID {tid}
        </>}
        tertiaryLine={<>
            {caughtCount !== undefined && renderCount(<UIPokedexIcons.Caught size='sm' />, caughtCount)}
            {ownedCount !== undefined && renderCount(<UIPokedexIcons.Owned size='sm' />, ownedCount)}
            {shinyCount !== undefined && shinyCount > 0 && renderCount(<UIPokedexIcons.Shiny size='sm' />, shinyCount)}
        </>}
        fourthLine={<>
            <TimerIcon /> {playTime}
            <Divider component='span' orientation='vertical' />
            {language}
        </>}
    />;
};
