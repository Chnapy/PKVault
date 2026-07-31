import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { BackendErrorsContext } from '../../data/backend-errors-context';
import { getCachedPkmIndex } from '../../data/hooks/use-pkm-index';
import { storageMovePkm, storageMovePkmBank } from '../../data/sdk/storage/storage.gen';
import { updateCacheMutationResponse } from '../../data/util/update-cache-mutation-response';
import { MoveProvider, type MoveProviderProps } from '../../ui/interaction/move/context/move-provider';
import { getDropPositions } from '../../ui/interaction/move/hooks/get-drop-positions';
import { SelectProvider, type SelectProviderProps } from '../../ui/interaction/select/context/select-provider';
import { filterIsDefined } from '../../util/filter-is-defined';
import { useCanMove } from './hooks/use-can-move';
import { useDroppableValidation } from './hooks/use-droppable-validation';
import { type MoveContainerValue, type MoveParams, containerFns } from './move-container-fns';

const useFilterStartDragIds: MoveProviderProps<MoveContainerValue, MoveParams>[ 'useFilterStartDragIds' ] = (container, ids) => {
    const canMoveFn = useCanMove(container.saveId ?? null, ids);

    return params => canMoveFn(params?.attached ?? false);
};

const useTargetAllPositions = (): MoveProviderProps<MoveContainerValue, MoveParams>[ 'getTargetAllPositions' ] => {
    const queryClient = useQueryClient();

    return React.useCallback((source, target) => {
        if (target.targetContainer.type === 'bank')
            return {};

        const sourceContainer = containerFns.getContainerValue(source.containerId);

        const sourcePkmIndex = getCachedPkmIndex(queryClient, sourceContainer.saveId ?? null)?.data;

        const sourceIds = Array.from(source.ids);

        const sourcePositions = Object.fromEntries(
            sourceIds.map(id => [
                id,
                sourcePkmIndex?.byId[ id ]?.boxSlot,
            ] as const)
                .filter((entry): entry is [ string, number ] => filterIsDefined(entry[ 1 ])),
        );

        return getDropPositions(
            target.targetPosition,
            sourceIds,
            sourcePositions,
        );
    }, [ queryClient ]);
};

const useOnDrop = (): MoveProviderProps<MoveContainerValue, MoveParams>[ 'onDrop' ] => {
    const queryClient = useQueryClient();
    const errorsOnMutationResponse = BackendErrorsContext.useOnMutationResponse();

    return React.useCallback(async (source, target) => {
        const sourceContainer = containerFns.getContainerValue(source.containerId);

        console.log('drop', sourceContainer, source, target)

        const pkmIds = Array.from(source.ids);

        if (pkmIds.length === 0) {
            console.log('no pkm-ids')
            return;
        }

        switch (target.targetContainer.type) {
            case 'bank': {
                if (sourceContainer.bankId === target.targetContainer.bankId)
                    return;

                try {
                    const response = await storageMovePkmBank({
                        pkmIds,
                        bankId: target.targetContainer.bankId,
                        sourceSaveId: sourceContainer.saveId ?? undefined,
                        attached: source.params?.attached,
                    });
                    updateCacheMutationResponse(queryClient, response);
                } catch (err) {
                    errorsOnMutationResponse(undefined, err as Error);
                }
                break;
            };
            default: {
                const targetBoxSlots = pkmIds
                    .map(id => target.targetAllPositions[ id ])
                    .filter(filterIsDefined);

                if (targetBoxSlots.length !== pkmIds.length) {
                    console.log('diff pkm-ids <-> target-slots', pkmIds.length, targetBoxSlots.length)
                    return;
                }

                try {
                    const response = await storageMovePkm({
                        pkmIds,
                        sourceSaveId: sourceContainer.saveId ?? undefined,
                        targetSaveId: target.targetContainer.saveId ?? undefined,
                        targetBoxId: target.targetContainer.boxId,
                        targetBoxSlots,
                        attached: source.params?.attached,
                    });
                    updateCacheMutationResponse(queryClient, response);
                } catch (err) {
                    errorsOnMutationResponse(undefined, err as Error);
                }
                break;
            };
        }
    }, [ errorsOnMutationResponse, queryClient ]);
};

export type MoveSelectImplProviderProps = {
    selectCtx?: SelectProviderProps<MoveContainerValue>[ 'initialValue' ];
    moveCtx?: Partial<Pick<
        MoveProviderProps<MoveContainerValue, MoveParams>,
        'initialState' | 'useFilterStartDragIds' | 'getTargetAllPositions' | 'dragStartComputeSlotStates' | 'onDrop'
    >>;
    children: React.ReactNode;
};

export const MoveSelectImplProvider: React.FC<MoveSelectImplProviderProps> = ({ selectCtx, moveCtx, children }) => {
    const getTargetAllPositions = useTargetAllPositions();
    const dragStartComputeSlotStates = useDroppableValidation().validate;
    const onDrop = useOnDrop();

    return <SelectProvider<MoveContainerValue>
        {...containerFns}
        initialValue={selectCtx}
    >
        <MoveProvider<MoveContainerValue, MoveParams>
            {...containerFns}
            moveContainerId='move-container'
            useFilterStartDragIds={useFilterStartDragIds}
            getTargetAllPositions={getTargetAllPositions}
            dragStartComputeSlotStates={dragStartComputeSlotStates}
            onDrop={onDrop}
            {...moveCtx}
        >
            {children}
        </MoveProvider>
    </SelectProvider>;
};
