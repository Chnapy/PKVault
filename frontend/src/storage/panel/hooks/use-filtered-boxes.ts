import { useStorageGetBoxes } from '../../../data/sdk/storage/storage.gen';
import { BankContext } from '../../bank/bank-context';

export const useFilteredBoxes = (saveId: number | null) => {
    const query = useStorageGetBoxes({ saveId: saveId ?? undefined });
    const { data } = query;

    const selectedBankBoxes = BankContext.useSelectedBankBoxes();

    const filteredData = saveId
        ? data
        : data && selectedBankBoxes.data && {
            ...data,
            data: data.data.filter(box => box.bankId === selectedBankBoxes.data?.selectedBank.id),
        };

    const isPending = [ query, selectedBankBoxes ].some(q => q.isPending && q.isEnabled);

    return {
        data: filteredData,
        isPending,
        isEnabled: true,
    };
};
