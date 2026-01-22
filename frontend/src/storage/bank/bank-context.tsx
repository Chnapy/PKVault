import { useSearch } from '@tanstack/react-router';
import { useStorageGetMainBanks, useStorageGetBoxes } from '../../data/sdk/storage/storage.gen';
import type { Route } from '../../routes/storage';
import { filterIsDefined } from '../../util/filter-is-defined';

export const BankContext = {
    useSelectedBankBoxes: () => {
        const mainBoxIds = useSearch({ from: '/storage', select: search => search.mainBoxIds, shouldThrow: false }) ?? [];

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

        type SearchInput = (typeof Route)[ 'types' ][ 'searchSchemaInput' ];

        return {
            ...payload,
            data: {
                selectedBank,
                selectedSearch:
                    selectedBoxes.length > 0
                        ? ({
                            mainBoxIds: selectedBoxes.map(box => box.idInt),
                            saves: Object.fromEntries(selectedBank.view.saves.map(save => [ save.saveId, save ])),
                        } satisfies SearchInput)
                        : undefined,
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

            const mainBoxIds: number[] = [ ...bank.view.mainBoxIds ];
            if (mainBoxIds.length === 0) {
                mainBoxIds.push(...[ boxesQuery.data?.data.find(box => box.bankId === bank.id)?.idInt ].filter(filterIsDefined));
            }

            const saves = Object.fromEntries(bank.view.saves.map(save => [ save.saveId, save ]));

            return {
                to: '/storage' as const satisfies (typeof Route)[ 'to' ],
                search: {
                    mainBoxIds,
                    saves,
                } satisfies (typeof Route)[ 'types' ][ 'searchSchemaInput' ],
            };
        };
    },
};
