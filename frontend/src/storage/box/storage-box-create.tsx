import type React from 'react';
import { useForm } from 'react-hook-form';
import { useStorageCreateMainBox } from '../../data/sdk/storage/storage.gen';
import { useTranslate } from '../../translate/i18n';
import { Button } from '../../ui/button/button';
import { Icon } from '../../ui/icon/icon';
import { TextInput } from '../../ui/input/text-input';
import { theme } from '../../ui/theme';

export const StorageBoxCreate: React.FC<{ close: () => void; }> = ({ close }) => {
    const { t } = useTranslate();

    const boxCreateMutation = useStorageCreateMainBox();

    const { register, handleSubmit, formState, watch } = useForm<{ name: string }>({
        defaultValues: {
            name: '',
        }
    });

    const onSubmit = handleSubmit(async ({ name }) => {
        await boxCreateMutation.mutateAsync({
            params: { boxName: name }
        });
        close();
    });

    return <form style={{ display: 'flex', gap: 4 }} onSubmit={onSubmit}>
        <TextInput
            {...register('name', { setValueAs: (value) => value.trim(), minLength: 2, maxLength: 64 })}
        />

        <Button type='submit' bgColor={theme.bg.primary} disabled={watch('name').length === 0 || !formState.isValid}>
            <Icon name='plus' forButton />
            {t('action.submit')}
        </Button>
    </form>;
};
