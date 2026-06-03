import React from 'react';
import { usePkmIndex } from '../../../data/hooks/use-pkm-index';
import { useStorageGetBoxes } from '../../../data/sdk/storage/storage.gen';
import { Route } from '../../../routes/storage';
import { UIStoragePanelFooter } from '../../../ui-new/storage/storage-panel/ui-storage-panel-footer';
import { BankContext } from '../../bank/bank-context';
import { useCurrentStorage } from '../storage-panel-context';

export const StoragePanelFooter: React.FC = () => {
    const { getStorage } = useCurrentStorage();
    const saveId = Route.useSearch({ select: (search) => getStorage(search.storages)?.saveId ?? null });

    // console.log('render box list ' + saveId);

    const selectedBankBoxes = BankContext.useSelectedBankBoxes();

    const boxesQuery = useStorageGetBoxes({ saveId: saveId ?? undefined });

    const boxes = (boxesQuery.data?.data ?? [])
        .filter(box => !box.bankId || box.bankId === selectedBankBoxes.data?.selectedBank.id);

    const boxId = Route.useSearch({ select: (search) => getStorage(search.storages)?.boxId }) ?? boxes[ 0 ]?.idInt;

    const pkmCountQuery = usePkmIndex(
        saveId,
        data => Object.keys(data.data.byBox[ boxId ?? -1 ] ?? {}).length,
    );

    const pkmTotalCountQuery = usePkmIndex(
        saveId,
        React.useCallback(data => Object.values(data.data.byBox).reduce((acc, box) => acc + Object.keys(box).length, 0), []),
    );

    const box = boxes.find(b => b.idInt === boxId);

    return <UIStoragePanelFooter
        boxSize={box?.slotCount ?? 0}
        pkmCount={pkmCountQuery.data ?? 0}
        pkmTotalCount={pkmTotalCountQuery.data ?? 0}
    />;
};
