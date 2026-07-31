import { usePkmIndex } from '../../../data/hooks/use-pkm-index';
import type { PkmSaveDTO, PkmVariantDTO } from '../../../data/sdk/model';
import { useSelectCallback } from '../../../util/use-select-callback';

export const useCanMove = (saveId: number | null, sourceIds: string[]) => {
    const canMovePkmIdsQuery = usePkmIndex(
        saveId,
        useSelectCallback(data => sourceIds.filter(id => {
            const pkm = data.data.byId[ id ];
            if (!pkm)
                return false;

            return pkm.canMove;
        }), [ sourceIds ]),
    );

    const canMoveAttachedPkmIdsQuery = usePkmIndex(
        saveId,
        useSelectCallback(data => sourceIds.filter(id => {
            const pkm = data.data.byId[ id ];
            if (!pkm)
                return false;

            if (saveId
                ? !(pkm as PkmSaveDTO).canMoveAttachedToMain
                : !(pkm as PkmVariantDTO).canMoveAttachedToSave
            ) {
                return false;
            }

            return pkm.canMove;
        }), [ sourceIds, saveId ]),
    );

    return (attached: boolean) => {
        return new Set(attached
            ? canMoveAttachedPkmIdsQuery.data
            : canMovePkmIdsQuery.data
        );
    };
};
