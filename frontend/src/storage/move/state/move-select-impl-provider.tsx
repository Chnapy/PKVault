import { useQueryClient } from '@tanstack/react-query';
import type React from 'react';
import { getCachedPkmIndex } from '../../../data/hooks/use-pkm-index';
import { storageMovePkm } from '../../../data/sdk/storage/storage.gen';
import { updateCacheMutationResponse } from '../../../data/util/update-cache-mutation-response';
import { MoveProvider } from '../../../ui-new/interaction/move/context/move-provider';
import { getDropPositions } from '../../../ui-new/interaction/move/hooks/get-drop-positions';
import { SelectProvider } from '../../../ui-new/interaction/select/context/select-provider';
import { filterIsDefined } from '../../../util/filter-is-defined';
import type { PkmSaveDTO, PkmVariantDTO } from '../../../data/sdk/model';

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

const containerFns = {
    getContainerHash,
    getContainerValue,
};

export const MoveSelectImplProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const queryClient = useQueryClient();

    return <SelectProvider<MoveContainerValue>
        {...containerFns}
    >
        <MoveProvider<MoveContainerValue, MoveParams>
            {...containerFns}
            moveContainerId='move-container'
            filterStartDragIds={source => {
                const sourceContainer = getContainerValue(source.containerId);
                const pkmIndex = getCachedPkmIndex(queryClient, sourceContainer.saveId)?.data;

                return new Set([ ...source.ids ].filter(id => {
                    const pkm = pkmIndex?.getById(id);
                    if (!pkm)
                        return false;

                    if (!pkm.canMove)
                        return false;

                    if (source.params?.attached) {
                        if (sourceContainer.saveId
                            ? !(pkm as PkmSaveDTO).canMoveAttachedToMain
                            : !(pkm as PkmVariantDTO).canMoveAttachedToSave
                        )
                            return false;
                    }

                    return true;
                }));
            }}
            getTargetAllPositions={(source, target) => {
                const sourceContainer = getContainerValue(source.containerId);

                const sourcePkmIndex = getCachedPkmIndex(queryClient, sourceContainer.saveId)?.data;

                const sourceIds = Array.from(source.ids);

                const sourcePositions = Object.fromEntries(
                    sourceIds.map(id => [
                        id,
                        sourcePkmIndex?.getById(id)?.boxSlot,
                    ]).filter(filterIsDefined),
                );

                return getDropPositions(
                    target.targetPosition,
                    sourceIds,
                    sourcePositions,
                );
            }}
            onDrop={async (source, target) => {
                const sourceContainer = getContainerValue(source.containerId);

                console.log(source, target, sourceContainer)

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
            }}
        >
            {children}
        </MoveProvider>
    </SelectProvider>;
};
