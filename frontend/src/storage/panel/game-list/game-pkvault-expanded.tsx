import React from 'react';
import { usePkmVariantIndex } from '../../../data/hooks/use-pkm-variant-index';
import { useDexGetAll } from '../../../data/sdk/dex/dex.gen';
import { useSettingsGet } from '../../../data/sdk/settings/settings.gen';
import { type UIGameExpandedProps } from '../../../ui/storage/storage-panel/game-list/ui-game-expanded';
import { UIGamePkvaultExpanded } from '../../../ui/storage/storage-panel/game-list/ui-game-pkvault-expanded';

export type GamePkvaultExpandedProps = Pick<UIGameExpandedProps, 'label' | 'imgSrc' | 'selected' | 'onSelect'>;

export const GamePkvaultExpanded: React.FC<GamePkvaultExpandedProps> = ({ label, imgSrc, onSelect, selected }) => {
    const settingsQuery = useSettingsGet();

    const ownedCountQuery = usePkmVariantIndex(
        React.useCallback(data => Object.values(data.data.byId).length, [])
    );

    const shinyCountQuery = usePkmVariantIndex(
        React.useCallback(data => Object.values(data.data.byId)
            .filter(pkm => pkm.isShiny)
            .length, [])
    );

    const caughtCountQuery = useDexGetAll({
        query: {
            select: data => {
                return Object.values(data.data)
                    .map(spec => spec[ 0 ])
                    .filter(spec => {
                        return spec?.forms.some(f => f.isCaught);
                    }).length;
            }
        },
    });

    if (!settingsQuery.data)
        return null;

    return <UIGamePkvaultExpanded
        label={label}
        imgSrc={imgSrc}
        selected={selected}
        onSelect={onSelect}
        caughtCount={caughtCountQuery.data ?? 0}
        ownedCount={ownedCountQuery.data ?? 0}
        shinyCount={shinyCountQuery.data ?? 0}
        path={settingsQuery.data.data.appDirectory}
    />;
};
