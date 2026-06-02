import type React from 'react';
import { usePkmIndex } from '../../../data/hooks/use-pkm-index';
import { useStorageGetBoxes } from '../../../data/sdk/storage/storage.gen';
import { Route } from '../../../routes/storage';
import { StorageItemPlaceholder } from '../../../ui/storage-item/storage-item-placeholder';
import { BankContext } from '../../bank/bank-context';
import { StorageMainItem } from '../../item/main/storage-main-item';
import { StorageSaveItem } from '../../item/save/storage-save-item';
import { useCurrentStorage } from '../storage-panel-context';

export const StoragePanelItems: React.FC = () => {

    const { getStorage, storageIndex } = useCurrentStorage();
    const saveId = Route.useSearch({ select: (search) => getStorage(search.storages)?.saveId ?? null })

    const selectedBankBoxes = BankContext.useSelectedBankBoxes();

    const boxesQuery = useStorageGetBoxes({ saveId: saveId ?? undefined });
    const pkmsQuery = usePkmIndex(saveId);

    const boxId = Route.useSearch({ select: (search) => getStorage(search.storages)?.boxId })
        ?? boxesQuery.data?.data[ 0 ]?.idInt ?? -1;

    const isLoading = [ selectedBankBoxes, boxesQuery, pkmsQuery ].some(query => query.isLoading);
    if (isLoading)
        return null;

    const selectedBox = boxesQuery.data?.data.find(box => box.idInt === boxId);
    const pkmIndex = pkmsQuery.data?.data;

    return new Array(selectedBox?.slotCount ?? 0).fill(0).map((_, i) => {
        const nodeId = `storage-item-${storageIndex}-${i}`;

        const variants = pkmIndex?.getByBoxSlot(boxId, i) ?? [];

        const firstVariant = variants[ 0 ];
        if (!firstVariant)
            return <StorageItemPlaceholder
                key={nodeId}
                nodeId={nodeId}
                type={saveId ? 'save-item' : 'main-item'}
                bankId={selectedBankBoxes.data?.selectedBank.id ?? ''}
                boxId={boxId.toString()}
                saveId={null}
                slot={i}
            />;

        const mainVariant = variants.length === 1
            ? firstVariant
            : variants.find(variant => 'isMain' in variant && variant.isMain) ?? firstVariant;

        return saveId
            ? <StorageSaveItem
                key={nodeId}
                nodeId={nodeId}
                saveId={saveId}
                pkmId={mainVariant.id}
            />
            : <StorageMainItem
                key={nodeId}
                nodeId={nodeId}
                pkmId={mainVariant.id}
            />;
    });
};
