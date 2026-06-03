import React from 'react';
import { usePkmIndex } from '../../../data/hooks/use-pkm-index';
import { useStorageGetBoxes } from '../../../data/sdk/storage/storage.gen';
import { Route } from '../../../routes/storage';
import { StorageItemPlaceholder } from '../../../ui/storage-item/storage-item-placeholder';
import { filterIsDefined } from '../../../util/filter-is-defined';
import { BankContext } from '../../bank/bank-context';
import { StorageMainItem } from '../../item/main/storage-main-item';
import { StorageSaveItem } from '../../item/save/storage-save-item';
import { useCurrentStorage } from '../storage-panel-context';

export const StoragePanelItems: React.FC = () => {

    const { getStorage, storageIndex } = useCurrentStorage();
    const saveId = Route.useSearch({ select: (search) => getStorage(search.storages)?.saveId ?? null })

    const selectedBankBoxes = BankContext.useSelectedBankBoxes();

    const boxesQuery = useStorageGetBoxes({ saveId: saveId ?? undefined });

    const boxId = Route.useSearch({ select: (search) => getStorage(search.storages)?.boxId })
        ?? boxesQuery.data?.data[ 0 ]?.idInt ?? -1;

    const selectedBox = boxesQuery.data?.data.find(box => box.idInt === boxId);

    const pkmsQuery = usePkmIndex(
        saveId,
        React.useCallback(data => {
            const pkms = data.data.byBox[ boxId ] ?? {};

            return new Array(selectedBox?.slotCount ?? 0).fill(0).map((_, i) => {
                const variants = Array.isArray(pkms[ i ]) ? pkms[ i ] : [ pkms[ i ] ].filter(filterIsDefined);
                const firstVariant = variants[ 0 ];
                if (!firstVariant)
                    return '';

                const mainVariant = variants.length === 1
                    ? firstVariant
                    : variants.find(variant => 'isMain' in variant && variant.isMain) ?? firstVariant;

                return mainVariant.id;
            }).join('---');
        }, [ boxId, selectedBox?.slotCount ]),
    );

    const isLoading = [ selectedBankBoxes, boxesQuery, pkmsQuery ].some(query => query.isLoading);
    if (isLoading)
        return null;

    const pkmIds = pkmsQuery.data?.split('---');

    return pkmIds?.map((id, i) => {
        const nodeId = `storage-item-${storageIndex}-${i}`;

        if (!id)
            return <StorageItemPlaceholder
                key={nodeId}
                nodeId={nodeId}
                type={saveId ? 'save-item' : 'main-item'}
                bankId={selectedBankBoxes.data?.selectedBank.id ?? ''}
                boxId={boxId.toString()}
                saveId={saveId}
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
};
