import { useQueryClient } from '@tanstack/react-query';
import { getCachedPkmIndex } from '../../../data/hooks/use-pkm-index';
import { getCachedPkmSaveIndex } from '../../../data/hooks/use-pkm-save-index';
import { getCachedPkmVariantIndex } from '../../../data/hooks/use-pkm-variant-index';
import { getSaveInfosGetAllQueryKey, type saveInfosGetAllResponseSuccess } from '../../../data/sdk/save-infos/save-infos.gen';
import { getStorageGetBoxesQueryKey, type storageGetBoxesResponseSuccess } from '../../../data/sdk/storage/storage.gen';
import { useTranslate } from '../../../translate/i18n';
import { useMoveContext } from '../../../ui-new/interaction/move/context/use-move-context';
import type { MoveContainerValue, MoveParams } from '../state/move-select-impl-provider';
import { buildSlotInfosSlot } from '../validation/slot-infos/build-slot-infos-slot';
import type { DropRefusalReason } from '../validation/types';
import { getHelpText } from '../validation/utils/get-help-text';
import { validateDrop } from '../validation/validate-drop';

export type UseDroppableValidationReturn = (targetSlot: number, targetContainer: MoveContainerValue) => {
    canDrop?: boolean;
    _disabledReason?: DropRefusalReason;
    helpText?: string;
};

export const useDroppableValidation = (): UseDroppableValidationReturn => {
    const queryClient = useQueryClient();
    const { useMoveStore, getContainerValue } = useMoveContext<MoveContainerValue, MoveParams>();

    const { t } = useTranslate();

    const source = useMoveStore(({ state }) => state.status === 'dragging'
        ? state.source
        : undefined);

    return (targetSlot: number, targetContainer: MoveContainerValue) => {
        if (!source)
            return {};

        const sourceContainer = getContainerValue(source.containerId);
        const attached = source.params?.attached ?? false;

        const sourcePkmIndex = getCachedPkmIndex(queryClient, sourceContainer.saveId)?.data;

        const slotInfos = buildSlotInfosSlot(
            Number(targetContainer.boxId),
            targetSlot,
            sourcePkmIndex?.getById(source.sourceId)?.boxSlot ?? -1,
            source.sourceId,
            sourceContainer.saveId,
            targetContainer.saveId,
            () => getCachedPkmVariantIndex(queryClient)?.data,
            () => sourceContainer.saveId ? getCachedPkmSaveIndex(queryClient, sourceContainer.saveId)?.data : undefined,
            () => targetContainer.saveId ? getCachedPkmSaveIndex(queryClient, targetContainer.saveId)?.data : undefined,
            () => queryClient.getQueryData<saveInfosGetAllResponseSuccess>(
                getSaveInfosGetAllQueryKey())?.data ?? {},
            () => Object.fromEntries(
                queryClient.getQueryData<storageGetBoxesResponseSuccess>(
                getStorageGetBoxesQueryKey({ saveId: sourceContainer.saveId ?? undefined }))?.data
                .map(box => [box.idInt, box]) ?? []
            ),
            () => Object.fromEntries(
                queryClient.getQueryData<storageGetBoxesResponseSuccess>(
                getStorageGetBoxesQueryKey({ saveId: targetContainer.saveId ?? undefined }))?.data
                .map(box => [box.idInt, box]) ?? []
            ),
        );

        const validation = validateDrop(
            {
                status: 'dragging',
                source: {
                    ids: [ ...source.ids ],
                    saveId: sourceContainer.saveId ?? undefined,
                    attached,
                },
            },
            slotInfos,
            getCachedPkmVariantIndex(queryClient)!.data!,
        );

        const helpText = validation.canDrop
            ? undefined
            : getHelpText(validation.reason, validation.slotInfos, attached, t);

        return {
            canDrop: validation.canDrop,
            _disabledReason: !validation.canDrop ? validation.reason : undefined,
            helpText,
        };
    };
};
