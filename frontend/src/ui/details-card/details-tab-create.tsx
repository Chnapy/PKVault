import type React from 'react';
import type { EntityContext, GameVersion } from '../../data/sdk/model';
import { getEntityContextGenerationName } from '../../data/util/get-entity-context-generation-name';
import { getGameInfos } from '../../pokedex/details/util/get-game-infos';
import { UIDetailsSaveTab } from '../../ui-new/storage/storage-details/saves/ui-details-save-tab';

export type DetailsTabCreateProps = {
    context: EntityContext;
    version: GameVersion;
};

export const DetailsTabCreate: React.FC<DetailsTabCreateProps> = ({ context, version }) => {
    const contextName = getEntityContextGenerationName(context, true);

    const gameInfos = getGameInfos(version, true);

    return <UIDetailsSaveTab
        id={context.toString()}
        version={version}
        color={gameInfos.color}
        selected={false}
        create
        label={contextName}
        isEnabled
    />;
};
