import { TrashIcon } from 'lucide-react';
import React from 'react';
import { usePkmIndex } from '../../../data/hooks/use-pkm-index';
import { useStorageMainDeletePkmVariant, useStorageSaveDeletePkms } from '../../../data/sdk/storage/storage.gen';
import { useTranslate } from '../../../translate/i18n';
import { UIButton } from '../../../ui/form/button/ui-button';
import { useSelectContextNullable } from '../../../ui/interaction/select/context/use-select-context';
import { UIConfirmPopover } from '../../../ui/popover/ui-confirm-popover';
import { filterIsDefined } from '../../../util/filter-is-defined';
import { pick } from '../../../util/pick';
import { useSelectCallback } from '../../../util/use-select-callback';
import type { MoveContainerValue } from '../../move/move-container-fns';
import type { ActionButtonDefaultProps } from './edit-pkm-button';

export type ReleasePkmButtonProps = ActionButtonDefaultProps & {
    container: MoveContainerValue;
    deleteAllRelatedVariants: boolean;
};

export const ReleasePkmButton: React.FC<ReleasePkmButtonProps> = ({ pkmIds, saveId, container, deleteAllRelatedVariants }) => {
    const { t } = useTranslate();

    const pkmIndexQuery = usePkmIndex(saveId ?? null,
        useSelectCallback(data => {
            return pkmIds.map(id => data.data.byId[ id ]).filter(filterIsDefined)
                .map(pkm => pick(pkm, [ 'id', 'canDelete' ]));
        }, [ pkmIds ]));

    const pkms = pkmIndexQuery.data ?? [];

    const mainPkmVariantDeleteMutation = useStorageMainDeletePkmVariant();
    const savePkmDeleteMutation = useStorageSaveDeletePkms();

    const selectCtx = useSelectContextNullable();

    const canReleaseList = pkms.filter(pkm => pkm.canDelete);

    const renderCount = (count: number) => {
        if (count < 2)
            return null;
        return <>({count})</>;
    };

    return <UIConfirmPopover
        label={t('storage.actions.release')}
        color='red'
        action={async () => {
            if (canReleaseList.length === 0)
                return;

            if (saveId) {
                await savePkmDeleteMutation.mutateAsync({
                    data: {
                        saveId,
                        pkmIds: canReleaseList.map(pkm => pkm.id),
                    },
                });
            } else {
                await mainPkmVariantDeleteMutation.mutateAsync({
                    data: {
                        pkmVariantIds: canReleaseList.map(pkm => pkm.id),
                        deleteAllRelatedVariants,
                    },
                });
            }

            if (selectCtx) {
                const selectState = selectCtx.useSelectStore.getState();

                if (selectState.container === selectCtx.getContainerHash(container)) {
                    const ids = new Set(selectState.ids);
                    canReleaseList.forEach(pkm => {
                        ids.delete(pkm.id);
                    });

                    if (ids.size !== selectState.ids.size)
                        selectCtx?.useSelectStore.setState({
                            container: ids.size === 0 ? '' : selectState.container,
                            ids,
                        });
                }
            }
        }}
    >
        <UIButton
            name='release'
            controlLabel={t('storage.actions.release')}
            variant='filled'
            color='red'
            size='compact-md'
            leftSection={<TrashIcon />}
            disabled={canReleaseList.length === 0}
        >
            {t('storage.actions.release')} {renderCount(canReleaseList.length)}
        </UIButton>
    </UIConfirmPopover>;
};
