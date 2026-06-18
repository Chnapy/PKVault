import { useStorageGetBoxes } from '../../../data/sdk/storage/storage.gen';
import { BankContext } from '../../bank/bank-context';

export const useFilteredBoxes = (saveId: number | null) => {
    const { data, isLoading } = useStorageGetBoxes({ saveId: saveId ?? undefined });

    const selectedBankBoxes = BankContext.useSelectedBankBoxes();

    const filteredData = saveId
        ? data
        : data && selectedBankBoxes.data && {
            ...data,
            data: data.data.filter(box => box.bankId === selectedBankBoxes.data?.selectedBank.id),
        };

    return {
        data: filteredData,
        isLoading: isLoading || selectedBankBoxes.isLoading,
    };
};
