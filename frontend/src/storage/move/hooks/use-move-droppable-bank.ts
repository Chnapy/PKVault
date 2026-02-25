import React from 'react';
import { usePkmSaveIndex, type PkmSaveIndexes } from '../../../data/hooks/use-pkm-save-index';
import { usePkmVariantIndex } from '../../../data/hooks/use-pkm-variant-index';
import { useSaveInfosGetAll } from '../../../data/sdk/save-infos/save-infos.gen';
import { useStorageGetBoxes, useStorageGetMainBanks, useStorageMovePkmBank } from '../../../data/sdk/storage/storage.gen';
import { useTranslate } from '../../../translate/i18n';
import { StorageSelectContext } from '../../actions/storage-select-context';
import { MoveContext } from '../context/move-context';
import { buildSlotInfosBank } from '../validation/slot-infos/build-slot-infos-bank';
import { getHelpText } from '../validation/utils/get-help-text';
import { validateDrop } from '../validation/validate-drop';
import type { UseMoveDroppableReturn } from './use-move-droppable';

const pkmSaveIndexesFallback: PkmSaveIndexes = {
    byId: {},
    byBox: {},
    byIdBase: {},
    bySpecies: {},
};

/**
 * Estimate if given bank can receive currently moving pkm.
 * If no moving pkm, do nothing.
 */
export const useMoveDroppableBank = (bankId: string): UseMoveDroppableReturn => {
    const { t } = useTranslate();
    const { state, dispatch } = MoveContext.useValue();
    const selectContext = StorageSelectContext.useValue();

    const sourceSaveId = state.status === 'dragging'
        ? state.source.saveId ?? 0
        : 0;

    const saveInfosQuery = useSaveInfosGetAll();

    const sourceBoxesQuery = useStorageGetBoxes(sourceSaveId ? { saveId: sourceSaveId } : undefined);

    const targetBanksQuery = useStorageGetMainBanks();

    const sourceBoxesData = React.useMemo(() => sourceBoxesQuery.data
        && Object.fromEntries(sourceBoxesQuery.data.data.map(box => [ box.idInt, box ])),
        [ sourceBoxesQuery.data ]);
    const targetBanksData = React.useMemo(() => targetBanksQuery.data
        && Object.fromEntries(targetBanksQuery.data.data.map(bank => [ bank.id, bank ])),
        [ targetBanksQuery.data ]);

    const pkmVariantsQuery = usePkmVariantIndex();
    const sourceSavePkmsQuery = usePkmSaveIndex(sourceSaveId);

    const movePkmBankMutation = useStorageMovePkmBank();

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
        || !targetBanksData
    ) {
        return {
            isDragging: false,
            isCurrentItemDragging: false,
        };
    }

    const slotInfosList = state.source.ids.flatMap(sourceId => {
        return buildSlotInfosBank(
            bankId,
            sourceId, state.source.saveId,
            pkmVariantsQuery.data.data,
            sourceSavePkmsQuery.data?.data ?? pkmSaveIndexesFallback,
            saveInfosQuery.data.data,
            sourceBoxesData,
            targetBanksData,
        );
    });

    const validation = validateDrop(
        state, slotInfosList,
        pkmVariantsQuery.data.data,
    );

    const filteredSlotInfosList = slotInfosList.filter(slotInfos =>
        slotInfos.sourceType !== 'main' || slotInfos.sourcePkm.isMain
    );

    const onDrop = validation.canDrop
        ? async () => {
            if (filteredSlotInfosList.length === 0) {
                return;
            }

            const sortedSlotInfosList = [ ...filteredSlotInfosList ]
                .sort((i1, i2) => (i1.sourcePkm.boxSlot < i2.sourcePkm.boxSlot ? -1 : 1));
            const pkmIds = [ ...new Set(sortedSlotInfosList.map(slotInfos => slotInfos.sourcePkm.id)) ];

            dispatch({
                type: 'DROP_ON_BANK',
                target: {
                    type: 'bank',
                    bankId,
                },
            });

            await movePkmBankMutation
                .mutateAsync({
                    params: {
                        bankId,
                        pkmIds,
                        sourceSaveId: state.source.saveId,
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
        isCurrentItemDragging: false,
        onClick: onDrop,
        onPointerUp: onDrop,
        helpText,
    };
};
