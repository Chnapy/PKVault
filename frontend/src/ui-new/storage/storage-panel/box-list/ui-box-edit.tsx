import { Group, NumberInput } from '@mantine/core';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import React from 'react';
import { useForm, useWatch, type UseFormRegisterReturn } from 'react-hook-form';
import { BoxType, type BankDTO, type BoxDTO, type StorageUpdateMainBoxParams } from '../../../../data/sdk/model';
import { useTranslate } from '../../../../translate/i18n';
import { UIButton } from '../../../form/button/ui-button';
import { UISelect } from '../../../form/select/ui-select';
import { UITextInput } from '../../../form/text-input/ui-text-input';
import { usePopover } from '../../../interaction/focus-controls/components/popover/hooks/use-popover';
import { UIFormCard } from '../../../popover/popover-card/ui-form-card';

type DataInput = StorageUpdateMainBoxParams;

type UIBoxEditProps = {
    boxId: string;
    selected?: boolean;
    defaultValues: DataInput;
    boxList: Pick<BoxDTO, 'id' | 'order'>[];
    bankList: Pick<BankDTO, 'id' | 'name'>[];
    minSlotCount: number;
    onOrderChange: (order: number) => void;
    onSubmit: (data: DataInput) => Promise<void>;
};

export const UIBoxEdit: React.FC<UIBoxEditProps> = ({ boxId, selected, defaultValues, boxList, bankList, minSlotCount, onOrderChange, onSubmit: onSubmitRaw }) => {
    const { t } = useTranslate();

    const popover = usePopover();

    const boxes = [ ...boxList ].sort((b1, b2) => b1.order < b2.order ? -1 : 1);

    const { register, handleSubmit, formState, setValue, control } = useForm({
        defaultValues,
    });
    const [ watchType, watchName, watchOrder, watchBankId, watchSlotCount ] = useWatch({ control, name: [ 'type', 'boxName', 'order', 'bankId', 'slotCount' ] });

    const previousBox = [ ...boxes ].reverse().find(b => b.id !== boxId && b.order <= watchOrder);
    const nextBox = boxes.find(b => b.id !== boxId && b.order >= watchOrder);

    const setOrder = (order: number) => {
        setValue('order', order);
        onOrderChange(order);
    };

    const onSubmit = handleSubmit(async (data) => {
        await onSubmitRaw(data);
        popover?.setOpened(false);
    });

    return <UIFormCard
        onSubmit={onSubmit}
        title={<>Edit {defaultValues.boxName}</>}
        disabled={watchName.length === 0 || !formState.isValid}
        miw={250}
    >
        <UITextInput
            {...register('boxName', {
                setValueAs: value => value.trim(),
                minLength: 2,
                maxLength: 64,
            })}
        />

        <UISelect
            {...register('type')}
            controlLabel='Set box type'
            label={t('storage.box.edit.type')}
            data={Object.entries(BoxType).map(([ key, value ]) => ({
                value: value.toString(),
                label: t(`storage.box.edit.type.${key.toLowerCase() as Lowercase<keyof typeof BoxType>}`),
            })) ?? []}
            value={watchType}
            onChange={(e) => setValue('type', Number(e.target.value) as BoxType)}
        />

        <NumberInput
            {...register('slotCount', {
                valueAsNumber: true,
                min: minSlotCount,
                max: 300,
            }) as Omit<UseFormRegisterReturn<"slotCount">, 'min' | 'max'>}
            label={t('storage.box.edit.slotCount')}
            description={`${minSlotCount} - ${300}`}
            value={watchSlotCount}
            onChange={value => setValue('slotCount', +value)}
        />

        <Group justify='space-between'>
            <UIButton
                name='order-left'
                controlLabel='Change order - left'
                onClick={() => previousBox && setOrder(previousBox.order - 5)}
                disabled={!previousBox}
            >
                <ChevronLeftIcon />
            </UIButton>
            {t('storage.bank.edit.order')}
            <UIButton
                name='order-right'
                controlLabel='Change order - right'
                onClick={() => nextBox && setOrder(nextBox.order + 5)}
                disabled={!nextBox}
            >
                <ChevronRightIcon />
            </UIButton>
        </Group>

        <UISelect
            {...register('bankId')}
            label={t('storage.box.edit.bank')}
            controlLabel='Change bank'
            data={bankList.map(bank => ({
                value: bank.id,
                label: bank.name,
            }))}
            value={watchBankId}
            onChange={e => setValue('bankId', e.target.value)}
            disabled={boxes.length <= 1}
        />
    </UIFormCard>;
};
