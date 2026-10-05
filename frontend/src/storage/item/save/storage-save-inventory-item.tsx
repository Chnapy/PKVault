import React from 'react';
import { useStorageGetInventoryItems } from '../../../data/sdk/storage/storage.gen';
import { withErrorCatcher } from '../../../error/with-error-catcher';
import { useSelectCallback } from '../../../util/use-select-callback';
import type { MoveContainerValue } from '../../move/move-container-fns';
import { useCurrentStorageWithFallback } from '../../panel/hooks/use-current-storage-with-fallback';
import { StorageInventoryItem, type StorageInventoryItemProps } from '../storage-inventory-item';

type StorageSaveInventoryItemProps = Pick<StorageInventoryItemProps, 'nodeId' | 'selectFromPreviousSelected' | 'slot'> & {
    saveId: number;
    pkmId: string;
};

export const StorageSaveInventoryItem: React.FC<StorageSaveInventoryItemProps> = withErrorCatcher(
    'item',
    React.memo(({ saveId, pkmId, ...rest }) => {
        const storage = useCurrentStorageWithFallback();
        const boxId = storage.data?.boxId;

        const inventoryItemQuery = useStorageGetInventoryItems({ saveId }, {
            query: {
                select: useSelectCallback(data => data.data[ pkmId ], [ pkmId ]),
            },
        });

        const container = React.useMemo((): MoveContainerValue => ({
            type: 'inventory-item',
            saveId,
            boxId: boxId?.toString() ?? '',
        }), [ saveId, boxId ]);

        if (!inventoryItemQuery.data) {
            return null;
        }

        const { id, item, name, version, count } = inventoryItemQuery.data;

        return <StorageInventoryItem
            id={id}
            item={item}
            version={version}
            name={name}
            container={container}
            count={count}
            {...rest}
        />;
    }),
);
