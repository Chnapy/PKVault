import type React from 'react';
import { useForm } from 'react-hook-form';
import { useStorageGetMainBoxes, useStorageUpdateMainBox } from '../../data/sdk/storage/storage.gen';
import { useTranslate } from '../../translate/i18n';
import { Button } from '../../ui/button/button';
import { Icon } from '../../ui/icon/icon';
import { TextInput } from '../../ui/input/text-input';
import { theme } from '../../ui/theme';
import { BankContext } from '../bank/bank-context';

export const StorageBoxEdit: React.FC<{ boxId: string; close: () => void; }> = ({ boxId, close }) => {
    const { t } = useTranslate();
    const selectedBankBoxes = BankContext.useSelectedBankBoxes();

    const box = useStorageGetMainBoxes().data?.data.find(box => box.id === boxId);
    const boxUpdateMutation = useStorageUpdateMainBox();

    const { register, handleSubmit, formState, watch } = useForm<{ name: string }>({
        defaultValues: {
            name: box?.name,
        }
    });

    const onSubmit = handleSubmit(async ({ name }) => {
        if (!selectedBankBoxes.data || !box) {
            return;
        }

        await boxUpdateMutation.mutateAsync({
            boxId,
            params: {
                boxName: name,
                order: box.order,
                bankId: selectedBankBoxes.data.selectedBank.id,
            }
        });
        close();
    });

    return <form style={{ display: 'flex', gap: 4 }} onSubmit={onSubmit}>
        <TextInput
            {...register('name', { setValueAs: (value) => value.trim(), minLength: 2, maxLength: 64 })}
        />

        <Button type='submit' bgColor={theme.bg.primary} disabled={watch('name').length === 0 || !formState.isValid}>
            <Icon name='pen' forButton />
            {t('action.submit')}
        </Button>
    </form>;
};
