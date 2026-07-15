import { Tooltip } from '@mantine/core';
import type React from 'react';
import type { EntityContext, GameVersion } from '../../data/sdk/model';
import { getEntityContextGenerationName } from '../../data/util/get-entity-context-generation-name';
import { getGameInfos } from '../../pokedex/details/util/get-game-infos';
import { useTranslate } from '../../translate/i18n';
import { UIDetailsSaveTab } from '../../ui-new/storage/storage-details/saves/ui-details-save-tab';

export type DetailsTabCreateProps = {
    context: EntityContext;
    version: GameVersion;
    loading?: boolean;
};

export const DetailsTabCreate: React.FC<DetailsTabCreateProps> = ({ context, version, loading }) => {
    const { t } = useTranslate();

    const contextName = getEntityContextGenerationName(context, true);

    const gameInfos = getGameInfos(version, true);

    return <Tooltip
        label={[
            t('storage.actions.create-variant', { generation: contextName }),
            t('storage.actions.create-variant.helpContent')
        ].join('\n\n')}
        disabled={loading}
    >
        <UIDetailsSaveTab
            id={context.toString()}
            version={version}
            color={gameInfos.color}
            selected={false}
            create
            label={contextName}
            isEnabled
            loading={loading}
        />
    </Tooltip>;
};
