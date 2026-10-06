import { Checkbox } from '@mantine/core';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { getCachedPkmIndex } from '../data/hooks/use-pkm-index';
import { getCachedPkmSaveIndex } from '../data/hooks/use-pkm-save-index';
import { getCachedPkmVariantIndex } from '../data/hooks/use-pkm-variant-index';
import { BoxType, type PkmSaveDTO, type PkmVariantDTO } from '../data/sdk/model';
import { getStorageGetInventoryItemsQueryKey, useStorageGetBoxes, type storageGetInventoryItemsResponseSuccess } from '../data/sdk/storage/storage.gen';
import { useSelectContext, useSelectContextActions } from '../ui/interaction/select/context/use-select-context';
import { useStorageMode } from '../ui/inventory/context/storage-mode-context';
import { filterIsDefined } from '../util/filter-is-defined';
import type { MoveContainerValue } from './move/move-container-fns';

const getCachedInventoryItems = (client: QueryClient, saveId: number | null) =>
    client.getQueryData<Partial<storageGetInventoryItemsResponseSuccess>>(getStorageGetInventoryItemsQueryKey({ saveId }));

export const StorageSelectCheckbox: React.FC<{
    saveId: number | null;
    boxId: number;
    disabled?: boolean;
} & Checkbox.Props> = ({ saveId, boxId, disabled, ...rest }) => {
    const queryClient = useQueryClient();

    const storageMode = useStorageMode().state;

    const { useSelectStore, getContainerHash } = useSelectContext<MoveContainerValue>();
    const { addId, clear } = useSelectContextActions<MoveContainerValue>();

    const box = useStorageGetBoxes({ saveId }).data?.data.find(box => box.idInt === boxId);

    const isInventory = box?.type === BoxType.Inventory;

    const container: MoveContainerValue = isInventory
        ? {
            type: 'inventory-item',
            saveId: saveId ?? undefined,
            boxId: String(boxId),
        }
        : saveId
            ? {
                type: 'save-item',
                saveId,
                boxId: String(boxId),
            }
            : {
                type: 'main-item',
                boxId: String(boxId),
            };
    const containerHash = getContainerHash(container);

    const state = useSelectStore(({ container, ids }): 'none' | 'none-disabled' | 'all' | 'intermediate' => {
        if (ids.size === 0)
            return 'none';

        if (containerHash !== container)
            return 'none';

        const boxItemsLength = isInventory
            ? Object.values(getCachedInventoryItems(queryClient, saveId)?.data ?? {})
                .filter(item => item.boxId === boxId)
                .length
            : Object.values(getCachedPkmIndex(queryClient, saveId)?.data?.byBox[ boxId ] ?? {})
                .map((pkms: PkmSaveDTO | PkmVariantDTO[]) => Array.isArray(pkms)
                    ? pkms.find(p => p.heldItem > 0) ?? pkms[ 0 ]!
                    : pkms)
                .filter(pkm => storageMode === 'default' || pkm.heldItem > 0)
                .length;

        if (boxItemsLength === 0)
            return 'none-disabled';

        return boxItemsLength === ids.size
            ? 'all'
            : 'intermediate';
    });

    disabled ||= state === 'none-disabled';

    return (
        <Checkbox
            {...rest}
            checked={state === 'all' || state === 'intermediate'}
            indeterminate={state === 'intermediate'}
            onChange={async () => {
                switch (state) {
                    case 'none-disabled':
                        break;
                    case 'none':
                    case 'intermediate': {
                        if (isInventory) {
                            const ids = Object.values(getCachedInventoryItems(queryClient, saveId)?.data ?? {})
                                .filter(item => item.boxId === boxId)
                                .map(item => item.id);

                            addId(container, ids);
                        } else {
                            const boxPkms = saveId
                                ? Object.values(getCachedPkmSaveIndex(queryClient, saveId)?.data?.byBox[ boxId ] ?? {})
                                : Object.values(getCachedPkmVariantIndex(queryClient)?.data?.byBox[ boxId ] ?? {})
                                    .map(variants => variants.find(v => v.isMain))
                                    .filter(filterIsDefined);

                            const ids = boxPkms
                                .filter(pkm => storageMode === 'default' || pkm.heldItem > 0)
                                .map(pkm => pkm.id);

                            addId(container, ids);
                        }
                        break;
                    }
                    case 'all':
                        clear();
                        break;
                }
            }}
            disabled={disabled}
        />
    );
};
