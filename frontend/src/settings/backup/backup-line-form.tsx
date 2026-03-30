import { css } from '@emotion/css';
import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useBackupEdit } from '../../data/sdk/backup/backup.gen';
import type { BackupDTO } from '../../data/sdk/model';
import { Button } from '../../ui/button/button';
import { Icon } from '../../ui/icon/icon';
import { TextInput } from '../../ui/input/text-input';
import { theme } from '../../ui/theme';

type BackupLineFormProps = Pick<BackupDTO, 'createdAt' | 'name'> & {
    onCancel: () => void;
};

const invalidFilenameChars = new Set([
    '"', '<', '>', '|', '\0', ':', '*', '?', '\\', '/'
]);

export const BackupLineForm: React.FC<BackupLineFormProps> = ({ createdAt, name, onCancel }) => {
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

        onCancel();
    });

    return <form
        onSubmit={submit}
        className={css({
            display: 'flex',
            gap: 4,
            height: 26,
        })}
    >
        <TextInput
            autoFocus
            value={nameValue}
            onChange={event => {
                const value = event.currentTarget.value;

                setValue('name', value
                    .trim()
                    .split('')
                    .filter(char => !invalidFilenameChars.has(char))
                    .join('')
                );
            }}
            maxLength={22}
            minLength={1}
            disabled={formState.isSubmitting}
        />

        <Button
            className={css({ fontSize: 14 })}
            onClick={onCancel}
            disabled={formState.isSubmitting}
        >
            <Icon name='times' solid forButton />
        </Button>
        <Button
            className={css({ fontSize: 14 })}
            type='submit'
            loading={formState.isSubmitting}
            disabled={!formState.isValid || !nameValue}
            bgColor={theme.bg.primary}
        >
            <Icon name='save' solid forButton />
        </Button>
    </form>;
};
