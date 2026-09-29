import React from 'react';
import { useStorageGetInventoryItems } from '../../../data/sdk/storage/storage.gen';
import { withErrorCatcher } from '../../../error/with-error-catcher';
import { useSelectCallback } from '../../../util/use-select-callback';
import type { MoveContainerValue } from '../../move/move-container-fns';
import { useCurrentStorageWithFallback } from '../../panel/hooks/use-current-storage-with-fallback';
import { StorageInventoryItem, type StorageInventoryItemProps } from '../storage-inventory-item';

type StorageMainInventoryItemProps = Pick<StorageInventoryItemProps, 'nodeId' | 'selectFromPreviousSelected' | 'slot'> & {
    pkmId: string;
};

export const StorageMainInventoryItem: React.FC<StorageMainInventoryItemProps> = withErrorCatcher(
    'item',
    React.memo(({ pkmId, ...rest }) => {
        const storage = useCurrentStorageWithFallback();
        const boxId = storage.data?.boxId;

        const inventoryQuery = useStorageGetInventoryItems({ saveId: null }, {
            query: {
                select: useSelectCallback(data => data.data[ pkmId ], [ pkmId ]),
            },
        });

        const container = React.useMemo((): MoveContainerValue => ({
            type: 'inventory-item',
            boxId: boxId?.toString() ?? '',
        }), [ boxId ]);

        if (!inventoryQuery.data) {
            return null;
        }

        const { id, item, name, version, count } = inventoryQuery.data;

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
