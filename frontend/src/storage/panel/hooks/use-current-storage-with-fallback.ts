import { Route } from '../../../routes/storage';
import { BankContext } from '../../bank/bank-context';
import { useCurrentStorage, useOtherStorage } from '../storage-panel-context';
import { useFilteredBoxes } from './use-filtered-boxes';
import { getFinalBox } from './utils/get-final-box';

export const useCurrentStorageWithFallback = () => {
    const { storageIndex, getStorage } = useCurrentStorage();
    const otherStorage = useOtherStorage();

    const saveId = Route.useSearch({ select: (search) => getStorage(search.storages)?.saveId });

    const selectedBankBoxes = BankContext.useSelectedBankBoxes();
    const selectedBoxes = selectedBankBoxes.data?.selectedBoxes ?? [];

    const boxesQuery = useFilteredBoxes(saveId ?? null);

    const isPending = [ selectedBankBoxes, boxesQuery ].some(q => q.isPending && q.isEnabled);

    const boxId = Route.useSearch({
        select: (search) => {
            const storage = getStorage(search.storages);
            if (storage?.saveId === undefined)
                return;

            return getFinalBox(
                storageIndex,
                storage,
                otherStorage.getStorage(search.storages),
                boxesQuery.data,
                selectedBoxes
            )?.id;
        }
    });

    const disabledBoxId = Route.useSearch({
        select: (search) => {
            const storage = otherStorage.getStorage(search.storages);
            if (storage?.saveId === undefined || storage.saveId !== saveId)
                return;

            return getFinalBox(
                (storageIndex + 1) % 2,
                storage,
                getStorage(search.storages),
                boxesQuery.data,
                selectedBoxes
            )?.id;
        }
    });

    const getData = () => {
        if (saveId === undefined)
            return;

        const box = boxesQuery.data?.data.find(b => b.id === boxId);

        return {
            saveId,
            boxId: box?.idInt,
            box,
            disabledBoxId,
            bankId: selectedBankBoxes.data?.selectedBank.id,
            bank: selectedBankBoxes.data?.selectedBank,
        };
    };

    return {
        isPending,
        isEnabled: true,
        data: getData(),
        storageIndex,
    };
};
