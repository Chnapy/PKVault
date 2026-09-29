import { usePkmIndex } from '../../../data/hooks/use-pkm-index';
import type { PkmSaveDTO, PkmVariantDTO } from '../../../data/sdk/model';
import { useStorageGetInventoryItems } from '../../../data/sdk/storage/storage.gen';
import { useStorageMode } from '../../../ui/inventory/context/storage-mode-context';
import { useSelectCallback } from '../../../util/use-select-callback';
import type { MoveContainerValue } from '../move-container-fns';

export const useCanMove = (container: MoveContainerValue, sourceIds: string[]) => {
    const storageMode = useStorageMode().state;

    const canMovePkmIdsQuery = usePkmIndex(
        container.saveId ?? null,
        useSelectCallback(data => sourceIds.filter(id => {
            const pkm = data.data.byId[ id ];
            if (!pkm)
                return false;

            switch (storageMode) {
                case 'default':
                    return pkm.canMove;
                case 'inventory':
                    return pkm.heldItem > 0;
            }
        }), [ sourceIds, storageMode ]),
        { enabled: container.type !== 'inventory-item' }
    );

    const canMoveAttachedPkmIdsQuery = usePkmIndex(
        container.saveId ?? null,
        useSelectCallback(data => sourceIds.filter(id => {
            const pkm = data.data.byId[ id ];
            if (!pkm)
                return false;

            switch (storageMode) {
                case 'default':
                    if (container.saveId
                        ? !(pkm as PkmSaveDTO).canMoveAttachedToMain
                        : !(pkm as PkmVariantDTO).canMoveAttachedToSave
                    ) {
                        return false;
                    }
                    break;
                case 'inventory':
                    return false;
            }

            return pkm.canMove;
        }), [ sourceIds, storageMode, container.saveId ]),
        { enabled: container.type !== 'inventory-item' }
    );

    const canMoveInventoryItemsQuery = useStorageGetInventoryItems({ saveId: container.saveId }, {
        query: {
            select: useSelectCallback(data => sourceIds.filter(id => {
                const item = data.data[ id ];
                if (!item)
                    return false;

                return item.canBeHeld;
            }), [ sourceIds ]),
            enabled: container.type === 'inventory-item',
        },
    });

    return (attached: boolean): Set<string> => {
        if (container.type === 'inventory-item') {
            switch (storageMode) {
                case 'default':
                    return new Set();
                case 'inventory':
                    return new Set(canMoveInventoryItemsQuery.data);
            }
        }

        return new Set(attached
            ? canMoveAttachedPkmIdsQuery.data
            : canMovePkmIdsQuery.data
        );
    };
};
