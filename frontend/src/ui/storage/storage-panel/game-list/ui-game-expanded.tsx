import { Box, Divider, Group } from '@mantine/core';
import { TimerIcon } from 'lucide-react';
import type React from 'react';
import type { Gender } from '../../../../data/sdk/model';
import { useTranslate } from '../../../../translate/i18n';
import { UIGender } from '../../../icon/ui-gender';
import { UIPokedexIcons } from '../../../pokedex/icons/ui-pokedex-icons';
import { UIGameExpandedWrapper, type UIGameExpandedWrapperProps } from './ui-game-expanded-wrapper';

export type UIGameExpandedProps = Pick<UIGameExpandedWrapperProps,
    'selected' | 'loading' | 'disabled' | 'onSelect' | 'editDropdown' | 'hasDuplicates' | 'actions' | 'label' | 'imgSrc' | 'path' | 'missingFile'>
    & {
        id?: string;
        generation: string;
        ot?: string;
        otGender?: Gender;
        tid?: number;
        caughtCount?: number;
        ownedCount?: number;
        shinyCount?: number;
        playTime?: string;
        language?: string;
    };

const renderCount = (icon: React.ReactNode, count: number) => <Group component='span' wrap='nowrap' gap='xs' style={{ flexShrink: 0 }}>
    {icon} <span>{count}</span>
</Group>;

export const UIGameExpanded: React.FC<UIGameExpandedProps> = ({
    generation, label, ot, otGender, tid, caughtCount, ownedCount, shinyCount, playTime, language,
    ...rest
}) => {
    const { t } = useTranslate();

    return <UIGameExpandedWrapper
        {...rest}
        label={<>
            <Box component='span' c='blue' mr='md'>{generation}</Box>{label}
        </>}
        secondaryLine={ot && otGender !== undefined && tid !== undefined && <>
            {t('save.ot')} {ot} <UIGender gender={otGender} /> - {t('details.tid')} {tid}
        </>}
        tertiaryLine={(caughtCount !== undefined || ownedCount !== undefined || shinyCount !== undefined) && <>
            {caughtCount !== undefined && renderCount(<UIPokedexIcons.Caught size='sm' />, caughtCount)}
            {ownedCount !== undefined && renderCount(<UIPokedexIcons.Owned size='sm' />, ownedCount)}
            {shinyCount !== undefined && shinyCount > 0 && renderCount(<UIPokedexIcons.Shiny size='sm' />, shinyCount)}
        </>}
        fourthLine={(playTime !== undefined || language !== undefined) && <>
            <TimerIcon /> {playTime}
            <Divider component='span' orientation='vertical' />
            {language}
        </>}
    />;
};
