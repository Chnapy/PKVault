import React from 'react';
import { usePkmIndex } from '../../../data/hooks/use-pkm-index';
import { useStorageGetBoxes } from '../../../data/sdk/storage/storage.gen';
import { Route } from '../../../routes/storage';
import { UIStoragePanelBoxList, type UIBoxData } from '../../../ui-new/storage/storage-panel/box-list/ui-storage-panel-box-list';
import { BankContext } from '../../bank/bank-context';
import { useCurrentStorage } from '../storage-panel-context';

export const StoragePanelBoxList: React.FC = () => {

    const { getStorage, setStorage } = useCurrentStorage();
    const saveId = Route.useSearch({ select: (search) => getStorage(search.storages)?.saveId ?? null });
    const navigate = Route.useNavigate();

    // console.log('render box list ' + saveId);

    const selectedBankBoxes = BankContext.useSelectedBankBoxes();

    const boxesQuery = useStorageGetBoxes({ saveId: saveId ?? undefined });
    const pkmsQuery = usePkmIndex(saveId);

    const boxes = (boxesQuery.data?.data ?? [])
        .filter(box => !box.bankId || box.bankId === selectedBankBoxes.data?.selectedBank.id);

    const boxId = Route.useSearch({ select: (search) => getStorage(search.storages)?.boxId?.toString() }) ?? boxes[ 0 ]?.id;

    const isLoading = [ selectedBankBoxes, boxesQuery, pkmsQuery ].some(query => query.isLoading);
    if (isLoading || !boxId)
        return null;

    const pkmIndex = pkmsQuery.data?.data;

    return <UIStoragePanelBoxList
        value={boxId}
        data={boxes.map(({ id, idInt, name, slotCount }): UIBoxData => ({
            id,
            label: name,
            slotsStates: new Array(slotCount).fill(0).map((_, i) => !!pkmIndex?.getByBoxSlot(idInt, i).length),
        }))}
        onSelect={id => {
            console.log('navigate to box', id)
            navigate({
                search: search => {
                    return {
                        ...search,
                        storages: setStorage(search.storages, { boxId: Number(id) }),
                    };
                },
            });
        }}
        onDelete={console.log}
    />;
};
