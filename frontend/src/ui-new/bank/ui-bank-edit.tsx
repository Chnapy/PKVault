import { Group, Stack, Tooltip } from '@mantine/core';
import { ChevronLeftIcon, ChevronRightIcon, SaveIcon, ScanEyeIcon } from 'lucide-react';
import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import type { BankDTO, BankView, StorageUpdateMainBankParams } from '../../data/sdk/model';
import { useTranslate } from '../../translate/i18n';
import { UIButton } from '../form/button/ui-button';
import { UISwitch } from '../form/switch/ui-switch';
import { UITextInput } from '../form/text-input/ui-text-input';
import { usePopover } from '../interaction/focus-controls/components/popover/hooks/use-popover';

type DataInput = StorageUpdateMainBankParams & { view: BankView };

type UIBankEditProps = {
    bankId: string;
    selected?: boolean;
    defaultValues: DataInput;
    bankList: Pick<BankDTO, 'id' | 'order' | 'isDefault'>[];
    currentBankView: BankView;
    onOrderChange: (order: number) => void;
    onSubmit: (data: DataInput) => Promise<void>;
};

export const UIBankEdit: React.FC<UIBankEditProps> = ({ bankId, selected, defaultValues, bankList, currentBankView, onOrderChange, onSubmit: onSubmitRaw }) => {
    const { t } = useTranslate();

    const setPopover = usePopover();

    const banks = [ ...bankList ].sort((b1, b2) => b1.order < b2.order ? -1 : 1);

    const { register, handleSubmit, formState, getValues, setValue, control } = useForm({
        defaultValues,
    });
    const [ watchName, watchIsDefault, watchOrder, watchView ] = useWatch({ control, name: [ 'bankName', 'isDefault', 'order', 'view' ] });

    const previousBank = [ ...banks ].reverse().find(b => b.id !== bankId && b.order <= watchOrder);
    const nextBank = banks.find(b => b.id !== bankId && b.order >= watchOrder);

    const defaultDisabled = watchIsDefault && banks.filter(b => b.id !== bankId && b.isDefault).length === 0;
    const viewHelpEnable = !selected;
    const viewDisabled = viewHelpEnable || JSON.stringify(watchView) === JSON.stringify(currentBankView);

    const setOrder = (order: number) => {
        setValue('order', order);
        onOrderChange(order);
    };

    const onSubmit = handleSubmit(async ({ view, ...rest }) => {
        view ??= defaultValues.view;

        await onSubmitRaw({
            view: view ?? defaultValues.view,
            ...rest,
        });
        setPopover?.(() => ({
            opened: false,
        }));
    });

    return <Stack
        component='form'
        onSubmit={onSubmit}
    >
        <UITextInput
            {...register('bankName', { setValueAs: (value) => value.trim(), minLength: 2, maxLength: 64 })}
        />

        <UISwitch
            name='is-default'
            controlLabel='Set default'
            label={t('storage.bank.edit.is-default')}
            checked={watchIsDefault}
            onChange={() => setValue('isDefault', !getValues('isDefault'))}
            disabled={defaultDisabled}
        />

        <Group>
            <UIButton
                name='order-left'
                controlLabel='Change order - left'
                onClick={() => previousBank && setOrder(previousBank.order - 5)}
                disabled={!previousBank}
            >
                <ChevronLeftIcon />
            </UIButton>
            {t('storage.bank.edit.order')}
            <UIButton
                name='order-right'
                controlLabel='Change order - right'
                onClick={() => nextBank && setOrder(nextBank.order + 5)}
                disabled={!nextBank}
            >
                <ChevronRightIcon />
            </UIButton>
        </Group>

        <Tooltip
            label={t('storage.bank.edit.view.help')}
            disabled={!viewHelpEnable}
        >
            <UIButton
                name='view'
                controlLabel='Set view'
                onClick={() => setValue('view', currentBankView)}
                disabled={viewDisabled}
            >
                <ScanEyeIcon />
                {t('storage.bank.edit.view')}
            </UIButton>
        </Tooltip>

        <UIButton
            name='submit'
            controlLabel='Submit'
            type='submit'
            disabled={watchName.length === 0 || !formState.isValid}
        >
            <SaveIcon />
            {t('action.submit')}
        </UIButton>
    </Stack>;
};
