import React from 'react';
import { type UIGameExpandedProps } from '../../../ui-new/storage/storage-panel/game-list/ui-game-expanded';
import { UIGamePkvaultExpanded } from '../../../ui-new/storage/storage-panel/game-list/ui-game-pkvault-expanded';
import { usePkmVariantIndex } from '../../../data/hooks/use-pkm-variant-index';
import { useSettingsGet } from '../../../data/sdk/settings/settings.gen';

export type GamePkvaultExpandedProps = Pick<UIGameExpandedProps, 'id' | 'label' | 'imgSrc' | 'selected' | 'onSelect'>;

export const GamePkvaultExpanded: React.FC<GamePkvaultExpandedProps> = ({ id, label, imgSrc, onSelect, selected }) => {
    const settingsQuery = useSettingsGet();

    const ownedCountQuery = usePkmVariantIndex(
        React.useCallback(data => Object.values(data.data.byId).length, [])
    );

    if (!settingsQuery.data)
        return null;

    return <UIGamePkvaultExpanded
        label={label}
        imgSrc={imgSrc}
        selected={selected}
        onSelect={onSelect}
        ownedCount={ownedCountQuery.data ?? 0}
        language={settingsQuery.data.data.settingsMutable.language!}
        path={settingsQuery.data.data.appDirectory}
    />;
};
