import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { getStorageGetMainBanksQueryKey, useStorageGetMainBanks, useStorageUpdateMainBank, type storageGetMainBanksResponseSuccess } from '../../data/sdk/storage/storage.gen';
import { Route } from '../../routes/storage';
import { UIBankEdit } from '../../ui-new/bank/ui-bank-edit';
import { BankContext } from './bank-context';
import { StorageBankView } from './util/storages-bank-view';

export const BankEdit: React.FC<{ bankId: string; }> = ({ bankId }) => {
    const storages = Route.useSearch({ select: search => search.storages }) ?? [];

    const queryClient = useQueryClient();

    const queryDataRef = React.useRef<storageGetMainBanksResponseSuccess>(null);

    const banksQuery = useStorageGetMainBanks();
    const banks = [ ...banksQuery.data?.data ?? [] ].sort((b1, b2) => b1.order < b2.order ? -1 : 1);
    const bank = banks.find(bank => bank.id === bankId);
    const bankUpdateMutation = useStorageUpdateMainBank();

    const selectedBankBoxes = BankContext.useSelectedBankBoxes();

    const currentBankView = StorageBankView.getBankViewFromStorages(storages);

    const selected = selectedBankBoxes.data?.selectedBank.id === bankId;

    React.useEffect(() => {
        return () => {
            if (queryDataRef.current) {
                queryClient.setQueryData(getStorageGetMainBanksQueryKey(), queryDataRef.current);
            }
        };
    }, [ queryClient ]);

    return bank && <UIBankEdit
        bankId={bankId}
        selected={selected}
        defaultValues={{
            bankName: bank.name,
            isDefault: bank.isDefault,
            order: bank.order,
            view: bank.view,
        }}
        bankList={banks}
        currentBankView={currentBankView}
        onOrderChange={order => {
            queryClient.setQueryData(getStorageGetMainBanksQueryKey(), (data: storageGetMainBanksResponseSuccess) => {
                if (!queryDataRef.current)
                    queryDataRef.current = data;

                return {
                    ...data,
                    data: data?.data
                        .map(b => {
                            if (b.id !== bankId)
                                return b;

                            return {
                                ...b,
                                order,
                            };
                        })
                        .sort((b1, b2) => b1.order < b2.order ? -1 : 1),
                };
            });
        }}
        onSubmit={async ({ bankName, isDefault, order, view }) => {
            await bankUpdateMutation.mutateAsync({
                bankId,
                params: {
                    bankName,
                    isDefault,
                    order,
                },
                data: view,
            });
        }}
    />;
};
