import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useForm } from 'react-hook-form';
import type { StorageUpdateMainBankParams } from '../../data/sdk/model';
import { getStorageGetMainBanksQueryKey, useStorageGetMainBanks, useStorageUpdateMainBank, type storageGetMainBanksResponse200 } from '../../data/sdk/storage/storage.gen';
import { useTranslate } from '../../translate/i18n';
import { Button } from '../../ui/button/button';
import { Icon } from '../../ui/icon/icon';
import { CheckboxInput } from '../../ui/input/checkbox-input';
import { TextInput } from '../../ui/input/text-input';
import { theme } from '../../ui/theme';

export const BankEdit: React.FC<{ bankId: string; close: () => void; }> = ({ bankId, close }) => {
    const { t } = useTranslate();

    const queryClient = useQueryClient();

    const banksQuery = useStorageGetMainBanks();
    const banks = banksQuery.data?.data ?? [];
    const bank = banks.find(bank => bank.id === bankId);
    const bankUpdateMutation = useStorageUpdateMainBank();

    const { register, handleSubmit, formState, watch, setValue } = useForm<StorageUpdateMainBankParams>({
        defaultValues: {
            bankName: bank?.name,
            isDefault: bank?.isDefault,
            order: bank?.order,
        }
    });

    const watchName = watch('bankName');
    const watchIsDefault = watch('isDefault');
    const watchOrder = watch('order');

    const previousBank = banks.find(b => b.id !== bankId && b.order < watchOrder);
    const nextBank = banks.find(b => b.id !== bankId && b.order > watchOrder);

    const onSubmit = handleSubmit(async ({ bankName, isDefault, order }) => {
        if (!bank) {
            return;
        }

        await bankUpdateMutation.mutateAsync({
            bankId,
            params: {
                bankName,
                isDefault,
                order,
            },
            data: bank.view,
        });
        close();
    });

    // apply some form data to cached data list to view in real-time name & order changes
    React.useEffect(() => {
        if (bank && (watchName !== bank.name || watchOrder !== bank.order)) {
            queryClient.setQueryData(getStorageGetMainBanksQueryKey(), (data: storageGetMainBanksResponse200) => {
                return {
                    ...data,
                    data: data?.data.map(b => {
                        if (b.id !== bankId) {
                            return b;
                        }

                        return {
                            ...b,
                            name: watchName,
                            order: watchOrder,
                        };
                    }),
                };
            });
        }
    }, [ bank, bankId, banksQuery.queryKey, queryClient, watchName, watchOrder ]);

    // reset list removing temp form data
    React.useEffect(() => {
        return () => {
            queryClient.invalidateQueries({ queryKey: getStorageGetMainBanksQueryKey() });
        };
    }, [ queryClient ]);

    return <form style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8
    }} onSubmit={onSubmit}>
        <TextInput
            {...register('bankName', { setValueAs: (value) => value.trim(), minLength: 2, maxLength: 64 })}
        />

        <label
            style={{
                display: 'flex',
                gap: 4,
                cursor: 'pointer',
                userSelect: 'none',
            }}
        >
            <CheckboxInput
                checked={watchIsDefault}
                onChange={() => setValue('isDefault', !watchIsDefault)}
                disabled={watchIsDefault && banks.filter(b => b.id !== bankId && b.isDefault).length === 0}
            /> Is default
        </label>

        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}
        >
            <Button
                onClick={() => previousBank && setValue('order', previousBank.order - 1)}
                disabled={!previousBank}
            >
                <Icon name='angle-left' solid forButton />
            </Button>
            Order
            <Button
                onClick={() => nextBank && setValue('order', nextBank.order + 1)}
                disabled={!nextBank}
            >
                <Icon name='angle-right' solid forButton />
            </Button>
        </div>

        <Button type='submit' bgColor={theme.bg.primary} disabled={watchName.length === 0 || !formState.isValid}>
            <Icon name='pen' forButton />
            {t('action.submit')}
        </Button>
    </form>;
};
