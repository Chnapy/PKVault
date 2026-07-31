import { Group } from '@mantine/core';
import type React from 'react';
import { useTranslate } from '../../../../translate/i18n';
import { UIPokedexIcons } from '../../../pokedex/icons/ui-pokedex-icons';
import { UIGameExpandedWrapper, type UIGameExpandedWrapperProps } from './ui-game-expanded-wrapper';

export type UIGamePkvaultExpandedProps = Pick<UIGameExpandedWrapperProps, 'selected' | 'onSelect' | 'label' | 'imgSrc' | 'path'>
    & {
        caughtCount: number;
        ownedCount: number;
        shinyCount: number;
    };

const renderCount = (icon: React.ReactNode, count: number) => <Group component='span' wrap='nowrap' gap='xs' style={{ flexShrink: 0 }}>
    {icon} <span>{count}</span>
</Group>;

export const UIGamePkvaultExpanded: React.FC<UIGamePkvaultExpandedProps> = ({
    caughtCount, ownedCount, shinyCount,
    ...rest
}) => {
    const { t } = useTranslate();

    return <UIGameExpandedWrapper
        {...rest}
        secondaryLine={t('pkvault.description')}
        tertiaryLine={<>
            {caughtCount !== undefined && renderCount(<UIPokedexIcons.Caught size='sm' />, caughtCount)}
            {ownedCount !== undefined && renderCount(<UIPokedexIcons.Owned size='sm' />, ownedCount)}
            {shinyCount !== undefined && shinyCount > 0 && renderCount(<UIPokedexIcons.Shiny size='sm' />, shinyCount)}
        </>}
    />;
};
