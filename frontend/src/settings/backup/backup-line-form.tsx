import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useBackupEdit } from '../../data/sdk/backup/backup.gen';
import type { BackupDTO } from '../../data/sdk/model';
import { PathUtil } from '../../ui/form/globs-input/util/path-util';
import { UITextInput } from '../../ui/form/text-input/ui-text-input';

type BackupLineFormProps = Pick<BackupDTO, 'createdAt' | 'name'> & {
    disabled?: boolean;
};

export const BackupLineForm: React.FC<BackupLineFormProps> = ({ createdAt, name, disabled }) => {
    const backupEditMutation = useBackupEdit();

    const { handleSubmit, setValue, formState, control } = useForm<{ name: string }>({
        defaultValues: {
            name,
        },
    });
    const [ nameValue = '' ] = useWatch({ control, name: [ 'name' ] });

    const submit = handleSubmit(async (data) => {
        await backupEditMutation.mutateAsync({
            params: {
                createdAt,
                name: data.name,
            },
        });
    });

    return <UITextInput
        name={createdAt + '-input'}
        value={nameValue}
        onChange={event => {
            const value = event.currentTarget.value;

            setValue('name', PathUtil.filterFilenameValidChars(value), { shouldDirty: true });
        }}
        // maw={200}
        styles={{
            input: {
                height: 'auto',
                minHeight: 0,
                lineHeight: 'inherit',
            },
        }}
        onSubmit={formState.isDirty ? submit : undefined}
        onCancel={formState.isDirty ? (() => setValue('name', name)) : undefined}
        disabled={disabled || formState.isSubmitting}
        cancelDisabled={formState.isSubmitting}
        submitLoading={formState.isSubmitting}
        submitDisabled={!formState.isValid || !nameValue}
    />;
};
