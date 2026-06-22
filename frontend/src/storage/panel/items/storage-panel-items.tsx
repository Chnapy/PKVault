import { Group } from '@mantine/core';
import React from 'react';
import { usePkmIndex } from '../../../data/hooks/use-pkm-index';
import { getBoxColumns } from '../../../ui-new/storage/storage-panel/get-box-columns';
import { StorageItemPlaceholder } from '../../../ui/storage-item/storage-item-placeholder';
import { filterIsDefined } from '../../../util/filter-is-defined';
import { useSelectCallback } from '../../../util/use-select-callback';
import { StorageMainItem } from '../../item/main/storage-main-item';
import { StorageSaveItem } from '../../item/save/storage-save-item';
import { useCurrentStorageWithFallback } from '../hooks/use-current-storage-with-fallback';
import { useCurrentStorage } from '../storage-panel-context';

export const StoragePanelItems: React.FC = () => {
    const { storageIndex } = useCurrentStorage();
    const storage = useCurrentStorageWithFallback();
    const { saveId = null, boxId, box } = storage.data ?? {};

    // always keep slotCount value so focus is never lost
    const slotCountRef = React.useRef(1);

    const getNodeId = (i: number) => `storage-item-${storageIndex}-${i}`;

    const getSlotCount = React.useCallback(() => box?.slotCount ?? slotCountRef.current, [ box?.slotCount ]);

    /**
     * Persist slotCount over box/game changes to avoid losing focus.
     */
    React.useEffect(() => {
        if (box)
            slotCountRef.current = box.slotCount;
    }, [ box ]);

    const pkmsQuery = usePkmIndex(
        saveId,
        useSelectCallback(data => {
            const pkms = boxId !== undefined
                ? data.data.byBox[ boxId ] ?? {}
                : {};

            return new Array(getSlotCount()).fill(0).map((_, i) => {
                const variants = Array.isArray(pkms[ i ]) ? pkms[ i ] : [ pkms[ i ] ].filter(filterIsDefined);
                const firstVariant = variants[ 0 ];
                if (!firstVariant)
                    return '';

                const mainVariant = variants.length === 1
                    ? firstVariant
                    : variants.find(variant => 'isMain' in variant && variant.isMain) ?? firstVariant;

                return mainVariant.id;
            });
        }, [ boxId, getSlotCount ]),
    );

    // const isLoading = [ storage, pkmsQuery ].some(query => query.isLoading);

    // eslint-disable-next-line react-hooks/refs
    const pkmIds = pkmsQuery.data ?? new Array<string>(getSlotCount()).fill('');

    const items = pkmIds.map((id, i) => {
        const nodeId = getNodeId(i);

        if (!id)
            return <StorageItemPlaceholder
                key={nodeId}
                nodeId={nodeId}
                saveId={saveId}
                boxId={boxId?.toString() ?? ''}
                slot={i}
            />;

        return saveId
            ? <StorageSaveItem
                key={nodeId}
                nodeId={nodeId}
                saveId={saveId}
                pkmId={id}
            />
            : <StorageMainItem
                key={nodeId}
                nodeId={nodeId}
                pkmId={id}
            />;
    });

    const cols = getBoxColumns(items.length);

    return <Group
        gap='sm'
        wrap='wrap'
        mx='auto'
        style={cols
            ? {
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                width: 'fit-content',
            }
            : undefined}
    >
        {items}
    </Group>
};
