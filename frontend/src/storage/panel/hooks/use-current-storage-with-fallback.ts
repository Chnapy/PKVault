import { useStorageGetBoxes } from '../../../data/sdk/storage/storage.gen';
import { Route } from '../../../routes/storage';
import { BankContext } from '../../bank/bank-context';
import { useCurrentStorage } from '../storage-panel-context';

export const useCurrentStorageWithFallback = () => {
    const { storageIndex, getStorage } = useCurrentStorage();
    const saveId = Route.useSearch({ select: (search) => getStorage(search.storages)?.saveId });
    const boxIdRaw = Route.useSearch({ select: (search) => getStorage(search.storages)?.boxId });

    const selectedBankBoxes = BankContext.useSelectedBankBoxes();
    const selectedBoxes = selectedBankBoxes.data?.selectedBoxes ?? [];

    const boxesQuery = useStorageGetBoxes({ saveId: saveId ?? undefined });

    const isLoading = [ selectedBankBoxes, boxesQuery ].some(q => q.isLoading);

    const getBox = () => {
        if (boxIdRaw !== undefined)
            return boxesQuery.data?.data.find(box => box.idInt === boxIdRaw);

        if (saveId)
            return boxesQuery.data?.data[ 0 ];

        return selectedBoxes.length > 1
            ? selectedBankBoxes.data?.selectedBoxes[ storageIndex ]
            : selectedBankBoxes.data?.selectedBoxes[ 0 ];
    };

    const getData = () => {
        if (saveId === undefined)
            return;

        const box = getBox();

        return {
            saveId,
            boxId: box?.idInt,
            box,
            bankId: selectedBankBoxes.data?.selectedBank.id,
            bank: selectedBankBoxes.data?.selectedBank,
        };
    };

    return {
        isLoading,
        data: getData(),
    };
};
