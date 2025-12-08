import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useForm } from 'react-hook-form';
import type { BankView, StorageUpdateMainBankParams } from '../../data/sdk/model';
import { getStorageGetMainBanksQueryKey, useStorageGetMainBanks, useStorageUpdateMainBank, type storageGetMainBanksResponse200 } from '../../data/sdk/storage/storage.gen';
import { Route } from '../../routes/storage';
import { useTranslate } from '../../translate/i18n';
import { Button } from '../../ui/button/button';
import { ButtonWithDisabledPopover } from '../../ui/button/button-with-disabled-popover';
import { Icon } from '../../ui/icon/icon';
import { CheckboxInput } from '../../ui/input/checkbox-input';
import { TextInput } from '../../ui/input/text-input';
import { theme } from '../../ui/theme';
import { filterIsDefined } from '../../util/filter-is-defined';
import { BankContext } from './bank-context';

export const BankEdit: React.FC<{ bankId: string; close: () => void; }> = ({ bankId, close }) => {
    const { t } = useTranslate();

    const mainBoxIds = Route.useSearch({ select: search => search.mainBoxIds }) ?? [];
    const savesSearch = Route.useSearch({ select: (search) => search.saves }) ?? {};

    const queryClient = useQueryClient();

    const banksQuery = useStorageGetMainBanks();
    const banks = [ ...banksQuery.data?.data ?? [] ].sort((b1, b2) => b1.order < b2.order ? -1 : 1);
    const bank = banks.find(bank => bank.id === bankId);
    const bankUpdateMutation = useStorageUpdateMainBank();

    const selectedBankBoxes = BankContext.useSelectedBankBoxes();

    const { register, handleSubmit, formState, watch, setValue } = useForm<StorageUpdateMainBankParams & { view?: BankView }>({
        defaultValues: {
            bankName: bank?.name,
            isDefault: bank?.isDefault,
            order: bank?.order,
            view: bank?.view,
        }
    });

    const watchName = watch('bankName');
    const watchIsDefault = watch('isDefault');
    const watchOrder = watch('order');
    const watchView = watch('view');

    const previousBank = [ ...banks ].reverse().find(b => b.id !== bankId && b.order <= watchOrder);
    const nextBank = banks.find(b => b.id !== bankId && b.order >= watchOrder);

    const currentBankView: BankView = {
        mainBoxIds,
        saves: Object.values(savesSearch).filter(filterIsDefined).map(({ saveId, saveBoxIds, order }) => ({
            saveId,
            saveBoxIds,
            order,
        }))
    };

    const defaultDisabled = watchIsDefault && banks.filter(b => b.id !== bankId && b.isDefault).length === 0;
    const viewHelpEnable = selectedBankBoxes.data?.selectedBank.id !== bankId;
    const viewDisabled = viewHelpEnable || JSON.stringify(watchView) === JSON.stringify(currentBankView);

    const onSubmit = handleSubmit(async ({ bankName, isDefault, order, view }) => {
        if (!bank) {
            return;
        }

        view ??= bank.view;

        await bankUpdateMutation.mutateAsync({
            bankId,
            params: {
                bankName,
                isDefault,
                order,
            },
            data: view,
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
    }, [ bank, bankId, queryClient, watchName, watchOrder ]);

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
                cursor: defaultDisabled ? 'not-allowed' : 'pointer',
                userSelect: 'none',
            }}
        >
            <CheckboxInput
                checked={watchIsDefault}
                onChange={() => setValue('isDefault', !watchIsDefault)}
                disabled={defaultDisabled}
            /> {t('storage.bank.edit.is-default')}
        </label>

        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}
        >
            <Button
                onClick={() => previousBank && setValue('order', previousBank.order - 5)}
                disabled={!previousBank}
            >
                <Icon name='angle-left' solid forButton />
            </Button>
            {t('storage.bank.edit.order')}
            <Button
                onClick={() => nextBank && setValue('order', nextBank.order + 5)}
                disabled={!nextBank}
            >
                <Icon name='angle-right' solid forButton />
            </Button>
        </div>

        <ButtonWithDisabledPopover
            as={Button}
            onClick={() => setValue('view', currentBankView)}
            helpTitle={t('storage.bank.edit.view.help')}
            disabled={viewDisabled}
            showHelp={viewHelpEnable}
        >
            <Icon name='eye' forButton />
            {t('storage.bank.edit.view')}
        </ButtonWithDisabledPopover>

        <Button type='submit' big bgColor={theme.bg.primary} disabled={watchName.length === 0 || !formState.isValid}>
            <Icon name='pen' forButton />
            {t('action.submit')}
        </Button>
    </form>;
};
