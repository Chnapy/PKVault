import React from 'react';
import { useStorageGetMainBanks, useStorageGetMainBoxes } from '../../data/sdk/storage/storage.gen';
import { Route } from '../../routes/storage';
import { filterIsDefined } from '../../util/filter-is-defined';

type BankContext = {
    value: {
        // selectedBank: string;
        editMode: boolean;
    };
    setValue: React.Dispatch<React.SetStateAction<BankContext[ 'value' ]>>;
};

const context = React.createContext<BankContext>({
    value: {
        // selectedBank: '', 
        editMode: false
    },
    setValue: () => void 0,
});

export const BankContext = {
    Provider: ({ children }: React.PropsWithChildren) => {
        const [ value, setValue ] = React.useState<BankContext[ 'value' ]>({
            // selectedBank: '',
            editMode: false,
        });
        // const mainBoxIds = Route.useSearch({ select: search => search.mainBoxIds }) ?? [];
        // const bankQuery = useStorageGetMainBanks();
        // const selectBank = BankContext.useSelectBank();

        // React.useEffect(() => {
        //     const defaultBank = bankQuery.data?.data.find(bank => bank.isDefault);
        //     if (mainBoxIds.length === 0 && defaultBank) {
        //         selectBank(defaultBank.id);
        //     }
        // }, [ bankQuery.data?.data, mainBoxIds.length, selectBank ]);

        return <context.Provider value={{
            value,
            setValue,
        }}>
            {children}
        </context.Provider>;
    },
    useValue: () => React.useContext(context),
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
            return payload;
        }

        const selectedBoxes = mainBoxIds.map(boxId => boxesQuery.data?.data.find(box => box.idInt === boxId)).filter(filterIsDefined);

        const selectedBankId = selectedBoxes[ 0 ]?.bankId ?? defaultBank.id;
        const selectedBank = bankQuery.data?.data.find(bank => bank.id === selectedBankId);
        if (!selectedBank) {
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
    useSelectBank: () => {
        const navigate = Route.useNavigate();

        const selectBankProps = BankContext.useSelectBankProps();

        return (bankId: string) => {
            const props = selectBankProps(bankId);
            if (!props) {
                return;
            }

            navigate(props);
        };
    },
    useStorageDefaultProps: () => {
        const selectBankProps = BankContext.useSelectBankProps();
        const bankQuery = useStorageGetMainBanks();

        const bankId = bankQuery.data?.data.find(bank => bank.isDefault)?.id;

        return bankId ? selectBankProps(bankId ?? '') : undefined;
    }
};
