import React from 'react';
import { usePkmIndex } from '../../../data/hooks/use-pkm-index';
import type { PkmSaveDTO, PkmVariantDTO } from '../../../data/sdk/model';
import type { MoveContainerValue } from '../state/move-select-impl-provider';

export const useCanMove = (container: MoveContainerValue, sourceIds: string[]) => {
    const pkmQuery = usePkmIndex(
        container.saveId,
        React.useCallback(data => Object.fromEntries(
            sourceIds.map(id => [
                id,
                data.data.byId[id],
            ])
        ), [sourceIds]),
    );

    return (attached: boolean) => {
        return new Set(Object.keys(pkmQuery.data ?? {}).filter(id => {
            const pkm = pkmQuery.data?.[id];
            if (!pkm) {
                // throw new Error('foobar ' + source.sourceId + ' ' + !!pkmIndex)
                return false;
            }

            if (!pkm.canMove) {
                // throw new Error('!canMove')
                return false;
            }

            if (attached) {
                if (container.saveId
                    ? !(pkm as PkmSaveDTO).canMoveAttachedToMain
                    : !(pkm as PkmVariantDTO).canMoveAttachedToSave
                ) {
                // throw new Error('!attached')
                    return false;
                }
            }

            return true;
        }));
    };
};
