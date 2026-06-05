import React from 'react';
import { useStorageCreateMainBox, useStorageGetBoxes } from '../../../data/sdk/storage/storage.gen';
import { Route } from '../../../routes/storage';
import { UIStoragePanelBoxList, type UIBoxData } from '../../../ui-new/storage/storage-panel/box-list/ui-storage-panel-box-list';
import { BankContext } from '../../bank/bank-context';
import { useCurrentStorage } from '../storage-panel-context';
import { BoxExpanded } from './box-expanded';

export const StoragePanelBoxList: React.FC = () => {
    const { getStorage, setStorage } = useCurrentStorage();
    const saveId = Route.useSearch({ select: (search) => getStorage(search.storages)?.saveId ?? null });
    const navigate = Route.useNavigate();

    const boxCreateMutation = useStorageCreateMainBox();

    const selectedBankBoxes = BankContext.useSelectedBankBoxes();
    const bankId = selectedBankBoxes.data?.selectedBank.id;

    const boxesQuery = useStorageGetBoxes({ saveId: saveId ?? undefined });

    const boxes = (boxesQuery.data?.data ?? [])
        .filter(box => !box.bankId || box.bankId === selectedBankBoxes.data?.selectedBank.id)
        .sort((b1, b2) => b1.order < b2.order ? -1 : 1);

    const boxId = Route.useSearch({ select: (search) => getStorage(search.storages)?.boxId?.toString() }) ?? boxes[ 0 ]?.id;

    const isLoading = [ selectedBankBoxes, boxesQuery ].some(query => query.isLoading);
    if (isLoading || !boxId)
        return null;

    const onSelect = (id: string) => {
        navigate({
            search: search => {
                return {
                    ...search,
                    storages: setStorage(search.storages, { boxId: Number(id) }),
                };
            },
        });
    };

    return <UIStoragePanelBoxList
        value={boxId}
        data={boxes.map(({ id, name }): UIBoxData => ({
            id,
            label: name,
        }))}
        onSelect={onSelect}
        onCreate={saveId || !bankId
            ? undefined
            : (() => boxCreateMutation.mutateAsync({ params: { bankId } }))
        }
        renderExpanded={(data, { reduce }) => data.map(({ item, selected }) => <BoxExpanded
            key={item.id}
            id={item.id}
            label={item.label}
            selected={selected}
            onSelect={() => {
                onSelect(item.id);
                reduce();
            }}
        />)}
    />;
};
