import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useSaveInfosGetAll } from '../../data/sdk/save-infos/save-infos.gen';
import { getStorageGetMainBanksQueryKey, useStorageGetMainBanks, useStorageUpdateMainBank, type storageGetMainBanksResponseSuccess } from '../../data/sdk/storage/storage.gen';
import { useStaticData } from '../../hooks/use-static-data';
import { Route, type StorageSearchStorage } from '../../routes/storage';
import { UIBankEdit } from '../../ui/bank/ui-bank-edit';
import { BankContext } from './bank-context';
import { StorageBankView } from './util/storages-bank-view';

export const BankEdit: React.FC<{ bankId: string; }> = ({ bankId }) => {
    const storages = Route.useSearch({ select: search => search.storages }) ?? [];

    const staticData = useStaticData();

    const queryClient = useQueryClient();

    const queryDataRef = React.useRef<storageGetMainBanksResponseSuccess>(null);

    const banksQuery = useStorageGetMainBanks();
    const banks = [ ...banksQuery.data?.data ?? [] ].sort((b1, b2) => b1.order < b2.order ? -1 : 1);
    const bank = banks.find(bank => bank.id === bankId);
    const bankUpdateMutation = useStorageUpdateMainBank();

    const selectedBankBoxes = BankContext.useSelectedBankBoxes();

    const currentBankView = StorageBankView.getBankViewFromStorages(storages);

    const selected = selectedBankBoxes.data?.selectedBank.id === bankId;

    const bankViewStorages = bank && StorageBankView.getStoragesFromBankView(bank.view);

    const saveInfosQuery = useSaveInfosGetAll();

    const getViewName = (storage: StorageSearchStorage) => {
        if (!storage.saveId)
            return 'PKVault';

        const save = saveInfosQuery.data?.data[ storage.saveId ];
        if (!save)
            return '-';

        return `${staticData.versions[ save.version ]?.name} (${save.trainerName})`;
    };

    const bankViewNames = (bankViewStorages ?? []).map(getViewName);
    const currentViewNames = storages.map(getViewName);

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
        bankViewNames={bankViewNames}
        currentViewNames={currentViewNames}
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
