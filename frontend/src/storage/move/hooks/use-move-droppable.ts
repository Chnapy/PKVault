import React from 'react';
import { usePkmSaveIndex, type PkmSaveIndexes } from '../../../data/hooks/use-pkm-save-index';
import { usePkmVariantIndex } from '../../../data/hooks/use-pkm-variant-index';
import { useSaveInfosGetAll } from '../../../data/sdk/save-infos/save-infos.gen';
import { useStorageGetBoxes, useStorageMovePkm } from '../../../data/sdk/storage/storage.gen';
import { useTranslate } from '../../../translate/i18n';
import { StorageSelectContext } from '../../actions/storage-select-context';
import { MoveContext } from '../context/move-context';
import { buildSlotInfosSlot } from '../validation/slot-infos/build-slot-infos-slot';
import type { DropRefusalReason } from '../validation/types';
import { getHelpText } from '../validation/utils/get-help-text';
import { validateDrop } from '../validation/validate-drop';

export type UseMoveDroppableReturn = {
    _disabledReason?: DropRefusalReason;
    isDragging: boolean;
    isCurrentItemDragging: boolean;
    onClick?: () => Promise<void>;
    onPointerUp?: () => Promise<void>;
    helpText?: string;
};

const pkmSaveIndexesFallback: PkmSaveIndexes = {
    byId: {},
    byBox: {},
    byIdBase: {},
    bySpecies: {},
};

/**
 * Estimate if given position can receive currently moving pkm.
 * If no moving pkm, do nothing.
 */
export const useMoveDroppable = (
    saveId: number | undefined, dropBoxId: number, dropBoxSlot: number, pkmId?: string
): UseMoveDroppableReturn => {
    const { t } = useTranslate();
    const { state, dispatch } = MoveContext.useValue();
    const selectContext = StorageSelectContext.useValue();

    const sourceSaveId = state.status === 'dragging'
        ? state.source.saveId ?? 0
        : 0;

    const saveInfosQuery = useSaveInfosGetAll();

    const sourceBoxesQuery = useStorageGetBoxes(sourceSaveId ? { saveId: sourceSaveId } : undefined);
    const targetBoxesQuery = useStorageGetBoxes(saveId ? { saveId } : undefined);

    const sourceBoxesData = React.useMemo(() => sourceBoxesQuery.data
        && Object.fromEntries(sourceBoxesQuery.data.data.map(box => [ box.idInt, box ])),
        [ sourceBoxesQuery.data ]);
    const targetBoxesData = React.useMemo(() => targetBoxesQuery.data
        && Object.fromEntries(targetBoxesQuery.data.data.map(box => [ box.idInt, box ])),
        [ targetBoxesQuery.data ]);

    const pkmVariantsQuery = usePkmVariantIndex();
    const sourceSavePkmsQuery = usePkmSaveIndex(sourceSaveId);
    const targetSavePkmsQuery = usePkmSaveIndex(saveId ?? 0);

    const movePkmMutation = useStorageMovePkm();

    if (state.status !== 'dragging') {
        return {
            _disabledReason: 'not-dragging',
            isDragging: false,
            isCurrentItemDragging: false,
        };
    }

    if (state.source.ids.length === 0) {
        return {
            isDragging: false,
            isCurrentItemDragging: false,
        };
    }

    const firstSourceId = state.source.ids[ 0 ]!;

    const firstSourcePkm = state.source.saveId
        ? sourceSavePkmsQuery.data?.data.byId[ firstSourceId ]
        : pkmVariantsQuery.data?.data.byId[ firstSourceId ];
    if (!firstSourcePkm
        || !pkmVariantsQuery.data
        || !saveInfosQuery.data
        || !sourceBoxesData
        || !targetBoxesData
    ) {
        return {
            isDragging: false,
            isCurrentItemDragging: false,
        };
    }

    const slotInfosList = state.source.ids.flatMap(sourceId => {
        return buildSlotInfosSlot(
            dropBoxId, dropBoxSlot,
            firstSourcePkm.boxSlot,
            sourceId, state.source.saveId, saveId,
            pkmVariantsQuery.data.data,
            sourceSavePkmsQuery.data?.data ?? pkmSaveIndexesFallback,
            targetSavePkmsQuery.data?.data ?? pkmSaveIndexesFallback,
            saveInfosQuery.data.data,
            sourceBoxesData,
            targetBoxesData,
        );
    });

    const validation = validateDrop(
        state, slotInfosList,
        pkmVariantsQuery.data.data,
    );

    const filteredSlotInfosList = slotInfosList.filter(slotInfos =>
        slotInfos.sourceType !== 'main' || slotInfos.sourcePkm.isMain
    );

    const isCurrentItemDragging = !!pkmId
        && state.source.ids.includes(pkmId)
        && state.source.saveId === saveId;

    const onDrop = validation.canDrop
        ? async () => {
            if (filteredSlotInfosList.length === 0) {
                return;
            }

            const pkmIds = [ ...new Set(filteredSlotInfosList.map(slotInfos => slotInfos.sourcePkm.id)) ];
            const targetBoxSlots = [ ...new Set(filteredSlotInfosList.map(slotInfos => slotInfos.targetSlot)) ];

            dispatch({
                type: 'DROP_ON_SLOT',
                target: {
                    type: 'slot',
                    saveId,
                    boxId: dropBoxId,
                    boxSlots: targetBoxSlots,
                },
            });

            await movePkmMutation
                .mutateAsync({
                    params: {
                        pkmIds,
                        sourceSaveId: state.source.saveId,
                        targetSaveId: saveId,
                        targetBoxId: dropBoxId.toString(),
                        targetBoxSlots,
                        attached: state.source.attached,
                    },
                })
                .then(() => {
                    if (selectContext.hasPkm(state.source.saveId, firstSourceId)) {
                        selectContext.clear();
                    }
                })
                .finally(() => {
                    dispatch({
                        type: 'COMPLETE',
                    });
                });
        }
        : undefined;

    const helpText = validation.canDrop
        ? undefined
        : getHelpText(validation.reason, validation.slotInfos, state.source.attached ?? false, t);

    return {
        _disabledReason: !validation.canDrop ? validation.reason : undefined,
        isDragging: true,
        isCurrentItemDragging,
        onClick: onDrop,
        onPointerUp: onDrop,
        helpText,
    };
};
