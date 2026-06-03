import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { getCachedPkmIndex } from '../../../data/hooks/use-pkm-index';
import { storageMovePkm } from '../../../data/sdk/storage/storage.gen';
import { updateCacheMutationResponse } from '../../../data/util/update-cache-mutation-response';
import { MoveProvider, type MoveProviderProps } from '../../../ui-new/interaction/move/context/move-provider';
import { getDropPositions } from '../../../ui-new/interaction/move/hooks/get-drop-positions';
import { SelectProvider, type SelectProviderProps } from '../../../ui-new/interaction/select/context/select-provider';
import { filterIsDefined } from '../../../util/filter-is-defined';
import { useCanMove } from '../hooks/use-can-move';

export type MoveContainerValue = {
    type: 'main-item' | 'save-item' | 'bank';
    bankId: string;
    saveId: number | null;
    boxId: string;
};

export type MoveParams = {
    attached: boolean;
};

const getContainerHash = ({ type, bankId, saveId, boxId }: MoveContainerValue): string => [ type, bankId, saveId, boxId ].join('---');

const getContainerValue = (hash: string): MoveContainerValue => {
    const [ type, bankId = '', saveIdRaw = '', boxId = '' ] = hash.split('---');

    const saveId = saveIdRaw === ''
        ? null
        : Number(saveIdRaw);

    return {
        type: type as MoveContainerValue[ 'type' ],
        bankId,
        saveId,
        boxId,
    };
};

export const containerFns = {
    getContainerHash,
    getContainerValue,
};

const useFilterStartDragIds: MoveProviderProps<MoveContainerValue, MoveParams>[ 'useFilterStartDragIds' ] = (container, ids) => {
    const canMoveFn = useCanMove(container, ids);

    return params => canMoveFn(params?.attached ?? false);
};

const useTargetAllPositions = (): MoveProviderProps<MoveContainerValue, MoveParams>[ 'getTargetAllPositions' ] => {
    const queryClient = useQueryClient();

    return React.useCallback((source, target) => {
        const sourceContainer = getContainerValue(source.containerId);

        const sourcePkmIndex = getCachedPkmIndex(queryClient, sourceContainer.saveId)?.data;

        const sourceIds = Array.from(source.ids);

        const sourcePositions = Object.fromEntries(
            sourceIds.map(id => [
                id,
                sourcePkmIndex?.getById(id)?.boxSlot,
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

    return React.useCallback(async (source, target) => {
        const sourceContainer = getContainerValue(source.containerId);

        console.log('drop', sourceContainer, source, target)

        const pkmIds = Array.from(source.ids);

        if (pkmIds.length === 0) {
            console.log('no pkm-ids')
            return;
        }

        const targetBoxSlots = pkmIds
            .map(id => target.targetAllPositions[ id ])
            .filter(filterIsDefined);

        if (targetBoxSlots.length !== pkmIds.length) {
            console.log('diff pkm-ids <-> target-slots', pkmIds.length, targetBoxSlots.length)
            return;
        }

        const response = await storageMovePkm({
            pkmIds,
            sourceSaveId: sourceContainer.saveId ?? undefined,
            targetSaveId: target.targetContainer.saveId ?? undefined,
            targetBoxId: target.targetContainer.boxId,
            targetBoxSlots,
            attached: source.params?.attached,
        });
        updateCacheMutationResponse(queryClient, response);
    }, [ queryClient ]);
};

export type MoveSelectImplProviderProps = {
    selectCtx?: SelectProviderProps<MoveContainerValue>[ 'initialValue' ];
    moveCtx?: Partial<Pick<
        MoveProviderProps<MoveContainerValue, MoveParams>,
        'initialState' | 'useFilterStartDragIds' | 'getTargetAllPositions' | 'onDrop'
    >>;
    children: React.ReactNode;
};

export const MoveSelectImplProvider: React.FC<MoveSelectImplProviderProps> = ({ selectCtx, moveCtx, children }) => {
    const getTargetAllPositions = useTargetAllPositions();
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
            onDrop={onDrop}
            {...moveCtx}
        >
            {children}
        </MoveProvider>
    </SelectProvider>;
};
