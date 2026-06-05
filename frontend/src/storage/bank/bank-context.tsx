import { useSearch } from '@tanstack/react-router';
import { useStorageGetBoxes, useStorageGetMainBanks } from '../../data/sdk/storage/storage.gen';
import type { Route } from '../../routes/storage';
import { filterIsDefined } from '../../util/filter-is-defined';
import { StorageBankView } from './util/storages-bank-view';

type SearchInput = (typeof Route)[ 'types' ][ 'searchSchemaInput' ];

export const BankContext = {
    useSelectedBankBoxes: () => {
        const getSelectStorage = (index: number) => (search: SearchInput) => {
            const storage = search.storages?.[ index ];
            return storage?.saveId ? undefined : storage?.boxId;
        };

        const mainBoxId1 = useSearch({ from: '/storage', select: getSelectStorage(0), shouldThrow: false });
        const mainBoxId2 = useSearch({ from: '/storage', select: getSelectStorage(1), shouldThrow: false });
        const mainBoxIds = [ mainBoxId1, mainBoxId2 ].filter(filterIsDefined);

        const bankQuery = useStorageGetMainBanks();
        const boxesQuery = useStorageGetBoxes();

        const queries = [ bankQuery, boxesQuery ];

        const isLoading = queries.some(query => query.isLoading);
        const isError = queries.some(query => query.isError || (query.data && query.data.status >= 400));

        const payload = {
            isLoading,
            isError,
            data: undefined,
        };

        if (isLoading || isError) {
            return payload;
        }

        const defaultBank = bankQuery.data?.data.find(bank => bank.isDefault);
        if (!defaultBank) {
            console.log('no-default-bank');
            return payload;
        }

        const selectedBoxes = mainBoxIds.map(boxId => boxesQuery.data?.data.find(box => box.idInt === boxId)).filter(filterIsDefined);

        const selectedBankId = selectedBoxes[ 0 ]?.bankId ?? defaultBank.id;
        const selectedBank = bankQuery.data?.data.find(bank => bank.id === selectedBankId);
        if (!selectedBank) {
            console.log('no-selected-bank');
            return payload;
        }

        if (selectedBoxes.length === 0) {
            selectedBoxes.push(...selectedBank.view.mainBoxIds.map(boxId => boxesQuery.data?.data.find(box => box.idInt === boxId)).filter(filterIsDefined));

            if (selectedBoxes.length === 0) {
                selectedBoxes.push(...[ boxesQuery.data?.data.find(box => box.bankId === selectedBankId) ].filter(filterIsDefined));
            }

            if (selectedBoxes.length === 0) {
                console.log('no-selected-boxes');
            }
        }

        return {
            ...payload,
            data: {
                selectedBank,
                selectedBoxes,
                // selectedSearch:
                //     selectedBoxes.length > 0
                //         ? ({
                //             mainBoxIds: selectedBoxes.map(box => box.idInt),
                //             saves: Object.fromEntries(selectedBank.view.saves.map(save => [ save.saveId, save ])),
                //         } satisfies SearchInput)
                //         : undefined,
            },
        };
    },
    useSelectBankProps: () => {
        const bankQuery = useStorageGetMainBanks();
        const boxesQuery = useStorageGetBoxes();

        return (bankId: string) => {
            const bank = bankQuery.data?.data.find(bank => bank.id === bankId);
            if (!bank) {
                return;
            }

            const storages = StorageBankView.getStoragesFromBankView(
                bank.view,
                boxesQuery.data?.data.find(box => box.bankId === bank.id)?.idInt,
            );

            return {
                to: '/storage' as const satisfies (typeof Route)[ 'to' ],
                search: {
                    storages,
                } satisfies SearchInput,
            };
        };
    },
};
