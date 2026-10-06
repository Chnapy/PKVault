import { EmptyState, Group, useMatches } from '@mantine/core';
import { PackageOpenIcon } from 'lucide-react';
import React from 'react';
import { useStorageGetInventoryItems } from '../../../data/sdk/storage/storage.gen';
import { useTranslate } from '../../../translate/i18n';
import { useSelectContext, useSelectContextActions } from '../../../ui/interaction/select/context/use-select-context';
import { useSpriteSizeLocalStorage } from '../../../ui/local-storage/use-storage-size-local-storage';
import { UISpriteSizeWrapper } from '../../../ui/sprite-img/ui-sprite-size-wrapper';
import { useSelectCallback } from '../../../util/use-select-callback';
import { StorageMainInventoryItem } from '../../item/main/storage-main-inventory-item';
import { StorageSaveInventoryItem } from '../../item/save/storage-save-inventory-item';
import { StorageInventoryItemPlaceholder } from '../../item/storage-inventory-item-placeholder';
import type { MoveContainerValue } from '../../move/move-container-fns';
import { useCurrentStorageWithFallback } from '../hooks/use-current-storage-with-fallback';
import { useCurrentStorage } from '../storage-panel-context';

export const StoragePanelInventoryItems: React.FC = () => {
    const { t } = useTranslate();

    const { storageIndex } = useCurrentStorage();
    const storage = useCurrentStorageWithFallback();
    const { saveId = null, boxId, box } = storage.data ?? {};

    const selectCtx = useSelectContext();
    const selectCtxAddIds = useSelectContextActions().addId;

    // always keep slotCount value so focus is never lost
    const slotCountRef = React.useRef(30);

    const getNodeId = (i: number) => `storage-item-${storageIndex}-${i}`;

    const getSlotCount = React.useCallback(() => box?.slotCount ?? slotCountRef.current, [ box?.slotCount ]);

    /**
     * Persist slotCount over box/game changes to avoid losing focus.
     */
    React.useEffect(() => {
        if (box)
            slotCountRef.current = box.slotCount;
    }, [ box ]);

    const inventoryQuery = useStorageGetInventoryItems({ saveId }, {
        query: {
            select: useSelectCallback(data => {
                const items = Object.values(data.data)
                    .filter(item => !box?.inventoryType || item.type === box?.inventoryType)
                    .filter(item => item.boxId === box?.idInt)
                    .sort((i1, i2) => i1.boxSlot - i2.boxSlot)
                    .map(item => item.id);
                return new Array<''>(getSlotCount()).fill('').map((none, i) => items[ i ] ?? none);
            }, [ box?.idInt, box?.inventoryType, getSlotCount ])
        }
    });

    const selectFromPreviousSelected = React.useCallback((targetId: string) => {
        if (boxId === undefined || !inventoryQuery.data?.length)
            return;

        const container: MoveContainerValue = {
            type: 'inventory-item',
            saveId: saveId ?? undefined,
            boxId: boxId.toString(),
        };
        const containerHash = selectCtx.getContainerHash(container);

        const state = selectCtx.useSelectStore.getState();

        const firstIdRaw = state.container === containerHash
            ? [ ...state.ids ][ state.ids.size - 1 ]
            : undefined;
        const firstId = firstIdRaw ?? inventoryQuery.data[ 0 ];

        let shouldSelect = false;
        const idsToSelect = firstId === targetId
            ? [ targetId ]
            : inventoryQuery.data.filter(id => {
                if (!id) return false;

                if (id === firstId || id === targetId) {
                    shouldSelect = !shouldSelect;
                    return true;
                }

                return shouldSelect;
            });

        selectCtxAddIds(container, idsToSelect);
    }, [ boxId, inventoryQuery.data, saveId, selectCtx, selectCtxAddIds ]);

    const isPending = [ storage, inventoryQuery ].some(query => query.isPending);

    const inventory = inventoryQuery.data
        // eslint-disable-next-line react-hooks/refs
        ?? new Array<''>(getSlotCount()).fill('');

    const items = inventory.map((id, i) => {
        const nodeId = getNodeId(i);

        if (!id)
            return <StorageInventoryItemPlaceholder
                key={nodeId}
                nodeId={nodeId}
                saveId={saveId}
                boxId={boxId?.toString() ?? ''}
                slot={i}
                loading={isPending}
            />;

        return saveId
            ? <StorageSaveInventoryItem
                key={nodeId}
                nodeId={nodeId}
                saveId={saveId}
                pkmId={id}
                slot={i}
                selectFromPreviousSelected={selectFromPreviousSelected}
            />
            : <StorageMainInventoryItem
                key={nodeId}
                nodeId={nodeId}
                pkmId={id}
                slot={i}
                selectFromPreviousSelected={selectFromPreviousSelected}
            />;
    });

    const emptyBox = inventory.every(id => !id);

    const [ speciesSizeRaw ] = useSpriteSizeLocalStorage('storage-sprite-size');

    const itemSize = useMatches({
        base: 1.5,
        lg: speciesSizeRaw * 2,
    });

    return <UISpriteSizeWrapper itemSize={itemSize}
        component={Group}
        gap='sm'
        wrap='wrap'
        mx='auto'
        pos='relative'
        w='fit-content'
    >
        {items}

        {!isPending && emptyBox && <EmptyState
            size='sm'
            icon={<PackageOpenIcon />}
            title={t('storage.box.empty')}
            style={{
                position: 'absolute',
                left: '50%',
                top: `calc(var(--sprite-item-size-multiplier) * ${30 * 2.5}px)`,
                transform: 'translate(-50%,-50%)',
                pointerEvents: 'none',
            }}
        />}
    </UISpriteSizeWrapper>
};
