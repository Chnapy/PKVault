import { useSearch } from '@tanstack/react-router';
import { useStorageGetBoxes, useStorageGetMainBanks, type storageGetBoxesResponseSuccess, type storageGetMainBanksResponseSuccess } from '../../data/sdk/storage/storage.gen';
import type { Route } from '../../routes/storage';
import { filterIsDefined } from '../../util/filter-is-defined';
import { StorageBankView } from './util/storages-bank-view';

type SearchInput = (typeof Route)[ 'types' ][ 'searchSchemaInput' ];

export const BankContext = {
    getSelectedBankBoxes: (
        mainBoxId1: number | undefined,
        mainBoxId2: number | undefined,
        banksData: storageGetMainBanksResponseSuccess | undefined,
        boxesData: storageGetBoxesResponseSuccess | undefined
    ) => {
        const mainBoxIds = [ mainBoxId1, mainBoxId2 ].filter(filterIsDefined);

        const defaultBank = banksData?.data.find(bank => bank.isDefault);
        if (!defaultBank) {
            console.log('no-default-bank');
            return;
        }

        const selectedBoxes = mainBoxIds.map(boxId => boxesData?.data.find(box => box.idInt === boxId)).filter(filterIsDefined);

        const selectedBankId = selectedBoxes[ 0 ]?.bankId ?? defaultBank.id;
        const selectedBank = banksData?.data.find(bank => bank.id === selectedBankId);
        if (!selectedBank) {
            console.log('no-selected-bank');
            return;
        }

        if (selectedBoxes.length === 0) {
            selectedBoxes.push(...selectedBank.view.mainBoxIds.map(boxId => boxesData?.data.find(box => box.idInt === boxId)).filter(filterIsDefined));

            if (selectedBoxes.length === 0) {
                selectedBoxes.push(...[ boxesData?.data.find(box => box.bankId === selectedBankId) ].filter(filterIsDefined));
            }

            if (selectedBoxes.length === 0) {
                console.log('no-selected-boxes');
            }
        }

        return {
            selectedBank,
            selectedBoxes,
            // selectedSearch:
            //     selectedBoxes.length > 0
            //         ? ({
            //             mainBoxIds: selectedBoxes.map(box => box.idInt),
            //             saves: Object.fromEntries(selectedBank.view.saves.map(save => [ save.saveId, save ])),
            //         } satisfies SearchInput)
            //         : undefined,
        };
    },
    useSelectedBankBoxes: () => {
        const getSelectStorage = (index: number) => (search: SearchInput) => {
            const storage = search.storages?.[ index ];
            return storage?.saveId ? undefined : storage?.boxId;
        };

        const mainBoxId1 = useSearch({ from: '/storage', select: getSelectStorage(0), shouldThrow: false });
        const mainBoxId2 = useSearch({ from: '/storage', select: getSelectStorage(1), shouldThrow: false });

        const bankQuery = useStorageGetMainBanks();
        const boxesQuery = useStorageGetBoxes();

        const queries = [ bankQuery, boxesQuery ];

        const isPending = queries.some(q => q.isPending && q.isEnabled);
        const isError = queries.some(query => query.isError || (query.data && query.data.status >= 400));

        const payload = {
            isPending,
            isEnabled: true,
            isError,
            data: undefined,
        };

        if (isPending || isError) {
            return payload;
        }

        return {
            ...payload,
            data: BankContext.getSelectedBankBoxes(
                mainBoxId1,
                mainBoxId2,
                bankQuery.data,
                boxesQuery.data,
            ),
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
