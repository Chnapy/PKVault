import { usePkmIndex } from '../../../../data/hooks/use-pkm-index';
import { getEntityContextGenerationName } from '../../../../data/util/get-entity-context-generation-name';
import { getGameInfos } from '../../../../pokedex/details/util/get-game-infos';
import type { UIDetailsSaveTabProps } from '../../../../ui/storage/storage-details/saves/ui-details-save-tab';
import { pick } from '../../../../util/pick';
import { useSelectCallback } from '../../../../util/use-select-callback';
import type { DetailsTabProps } from '../details-tab';

export const useDetailsTabProps = ({ id, saveId }: Pick<DetailsTabProps, 'id' | 'saveId'>) => {
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

    return {
        id,
        imgSrc: gameInfos.img,
        label: contextName ?? '',
        isEnabled: isEnabled,
        isMain: !!pkmIndex && pkmIndex.isMain,
    } satisfies Partial<UIDetailsSaveTabProps>;
};
