import { EmptyState, Group } from '@mantine/core';
import { PackageOpenIcon } from 'lucide-react';
import React from 'react';
import { usePkmIndex } from '../../../data/hooks/use-pkm-index';
import { useTranslate } from '../../../translate/i18n';
import { useSelectContext, useSelectContextActions } from '../../../ui/interaction/select/context/use-select-context';
import { getBoxColumns } from '../../../ui/storage/storage-panel/get-box-columns';
import { filterIsDefined } from '../../../util/filter-is-defined';
import { useSelectCallback } from '../../../util/use-select-callback';
import { StorageMainItem } from '../../item/main/storage-main-item';
import { StorageSaveItem } from '../../item/save/storage-save-item';
import { StorageItemPlaceholder } from '../../item/storage-item-placeholder';
import type { MoveContainerValue } from '../../move/move-container-fns';
import { useCurrentStorageWithFallback } from '../hooks/use-current-storage-with-fallback';
import { useCurrentStorage } from '../storage-panel-context';

export const StoragePanelItems: React.FC = () => {
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

    const selectFromPreviousSelected = React.useCallback((targetId: string) => {
        if (boxId === undefined || !pkmsQuery.data?.length)
            return;

        const container: MoveContainerValue = saveId
            ? {
                type: 'save-item',
                saveId,
                boxId: boxId.toString(),
            }
            : {
                type: 'main-item',
                boxId: boxId.toString(),
            };
        const containerHash = selectCtx.getContainerHash(container);

        const state = selectCtx.useSelectStore.getState();

        const firstIdRaw = state.container === containerHash
            ? [ ...state.ids ][ state.ids.size - 1 ]
            : undefined;
        const firstId = firstIdRaw ?? pkmsQuery.data[ 0 ]!;

        let shouldSelect = false;
        const idsToSelect = firstId === targetId
            ? [ targetId ]
            : pkmsQuery.data.filter(id => {
                if (!id) return false;

                if (id === firstId || id === targetId) {
                    shouldSelect = !shouldSelect;
                    return true;
                }

                return shouldSelect;
            });

        selectCtxAddIds(container, idsToSelect);
    }, [ boxId, pkmsQuery.data, saveId, selectCtx, selectCtxAddIds ]);

    const isPending = [ storage, pkmsQuery ].some(query => query.isPending);

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
                loading={isPending}
            />;

        return saveId
            ? <StorageSaveItem
                key={nodeId}
                nodeId={nodeId}
                saveId={saveId}
                pkmId={id}
                selectFromPreviousSelected={selectFromPreviousSelected}
            />
            : <StorageMainItem
                key={nodeId}
                nodeId={nodeId}
                pkmId={id}
                selectFromPreviousSelected={selectFromPreviousSelected}
            />;
    });

    const emptyBox = pkmIds.every(id => !id);

    const cols = getBoxColumns(items.length);

    return <Group
        gap='sm'
        wrap='wrap'
        mx='auto'
        pos='relative'
        w='fit-content'
        style={cols
            ? {
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
            }
            : undefined}
    >
        {items}

        {!isPending && emptyBox && <EmptyState
            size='sm'
            icon={<PackageOpenIcon />}
            title={t('storage.box.empty')}
            style={{
                position: 'absolute',
                left: '50%',
                top: 245,
                transform: 'translate(-50%,-50%)',
                pointerEvents: 'none',
            }}
        />}
    </Group>
};
