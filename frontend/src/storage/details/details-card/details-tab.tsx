import type React from 'react';
import { usePkmIndex } from '../../../data/hooks/use-pkm-index';
import { getEntityContextGenerationName } from '../../../data/util/get-entity-context-generation-name';
import { getGameInfos } from '../../../pokedex/details/util/get-game-infos';
import type { UIExpandableTabsData } from '../../../ui/expandable-tabs/ui-expandable-tabs';
import { UIDetailsSaveTab } from '../../../ui/storage/storage-details/saves/ui-details-save-tab';
import { pick } from '../../../util/pick';
import { useSelectCallback } from '../../../util/use-select-callback';

export type DetailsTabProps = UIExpandableTabsData & {
    saveId: number | null;
    selected?: boolean;
    warning?: boolean;
};

export const DetailsTab: React.FC<DetailsTabProps> = ({ id, saveId, warning, selected = false }) => {
    const pkmIndexQuery = usePkmIndex(saveId,
        useSelectCallback(data => {
            const pkm = data.data.byId[ id ];
            if (!pkm)
                return;

            return {
                ...pick(pkm, [ 'isEnabled', 'context', 'contextVersion' ]),
                isMain: 'isMain' in pkm ? pkm.isMain : true,
            };
        }, [ id ])
    );

    const pkmIndex = pkmIndexQuery?.data;

    const isEnabled = pkmIndex?.isEnabled ?? true;
    const contextVersion = pkmIndex?.isEnabled ? pkmIndex.contextVersion : null;
    const contextName = pkmIndex && getEntityContextGenerationName(pkmIndex.context, true);

    const gameInfos = getGameInfos(contextVersion, isEnabled);

    return <UIDetailsSaveTab
        id={id}
        version={contextVersion}
        color={gameInfos.color}
        selected={selected}
        label={contextName}
        isEnabled={isEnabled}
        isMain={!!pkmIndex && pkmIndex.isMain}
        warning={warning}
    />;
};
