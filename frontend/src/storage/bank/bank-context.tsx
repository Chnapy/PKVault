import { useStorageGetMainBanks, useStorageGetMainBoxes } from '../../data/sdk/storage/storage.gen';
import { Route } from '../../routes/storage';
import { filterIsDefined } from '../../util/filter-is-defined';

export const BankContext = {
    useSelectedBankBoxes: () => {
        const mainBoxIds = Route.useSearch({ select: search => search.mainBoxIds }) ?? [];

        const bankQuery = useStorageGetMainBanks();
        const boxesQuery = useStorageGetMainBoxes();

        const queries = [ bankQuery, boxesQuery ];

        const isLoading = queries.some(query => query.isLoading);
        const isError = queries.some(query => query.isError || (query.data && query.data.status >= 400));

        const payload = {
            isLoading,
            isError,
            data: undefined
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
            selectedBoxes.push(
                ...selectedBank.view.mainBoxIds.map(boxId => boxesQuery.data?.data.find(box => box.idInt === boxId)).filter(filterIsDefined)
            );

            if (selectedBoxes.length === 0) {
                selectedBoxes.push(
                    ...[ boxesQuery.data?.data.find(box => box.bankId === selectedBankId) ].filter(filterIsDefined)
                );
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
            },
        };
    },
    useSelectBankProps: () => {
        const bankQuery = useStorageGetMainBanks();
        const boxesQuery = useStorageGetMainBoxes();

        return (bankId: string) => {
            const bank = bankQuery.data?.data.find(bank => bank.id === bankId);
            if (!bank) {
                return;
            }

            const mainBoxIds: number[] = [ ...bank.view.mainBoxIds ];
            if (mainBoxIds.length === 0) {
                mainBoxIds.push(
                    ...[ boxesQuery.data?.data.find(box => box.bankId === bank.id)?.idInt ].filter(filterIsDefined)
                );
            }

            const saves = [ ...bank.view.saves ];

            return {
                to: '/storage' as const satisfies (typeof Route)[ 'to' ],
                search: {
                    mainBoxIds,
                    saves,
                } satisfies (typeof Route)[ 'types' ][ 'searchSchemaInput' ]
            }
        };
    },
    useStorageDefaultProps: () => {
        const selectBankProps = BankContext.useSelectBankProps();
        const bankQuery = useStorageGetMainBanks();

        const bankId = bankQuery.data?.data.find(bank => bank.isDefault)?.id;

        return bankId ? selectBankProps(bankId ?? '') : undefined;
    }
};
