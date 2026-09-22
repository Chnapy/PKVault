import type { EntityContext, GameVersion } from '../../../../data/sdk/model';
import { getEntityContextGenerationName } from '../../../../data/util/get-entity-context-generation-name';
import { getGameInfos } from '../../../../pokedex/details/util/get-game-infos';
import { useTranslate } from '../../../../translate/i18n';
import type { UIDetailsSaveTabProps } from '../../../../ui/storage/storage-details/saves/ui-details-save-tab';

export type DetailsTabCreateCommonProps = {
    context: EntityContext;
    version: GameVersion;
};

export const useDetailsTabCreateProps = ({ context, version }: DetailsTabCreateCommonProps) => {
    const { t } = useTranslate();

    const contextName = getEntityContextGenerationName(context, true);

    const gameInfos = getGameInfos(version, true);

    return {
        tooltip: [
            t('storage.actions.create-variant', { generation: contextName }),
            t('storage.actions.create-variant.helpContent')
        ].join('\n\n'),
        id: context.toString(),
        imgSrc: gameInfos.img,
        create: true,
        label: contextName,
    } satisfies Partial<UIDetailsSaveTabProps> & { tooltip: string };
};
