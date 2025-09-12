import React from 'react';
import { useForm } from 'react-hook-form';
import type { SettingsDTO } from '../data/sdk/model';
import { useSettingsEdit, useSettingsGet } from '../data/sdk/settings/settings.gen';
import { Button } from '../ui/button/button';
import { TitledContainer } from '../ui/container/titled-container';
import { TextInput } from '../ui/input/text-input';
import { theme } from '../ui/theme';

export const Settings: React.FC = () => {
    const settingsQuery = useSettingsGet();
    const settingsMutation = useSettingsEdit();

    const settings = settingsQuery.data?.data;

    const defaultValue = React.useMemo(() => settings && ({
        ...settings,
        savE_GLOBS: settings.savE_GLOBS.join('\n'),
    }), [ settings ]);

    const { register, reset, handleSubmit } = useForm<Omit<SettingsDTO, 'savE_GLOBS'> & { savE_GLOBS: string }>({
        defaultValues: defaultValue
    });

    if (!settings) {
        return null;
    }

    const submit = handleSubmit(async (data) => {
        await settingsMutation.mutateAsync({
            data: {
                ...data,
                savE_GLOBS: data.savE_GLOBS.split('\n').filter(Boolean)
            },
        });
    });

    return <TitledContainer title={`Settings`}>
        <form
            style={{
                minWidth: 500,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
            }}
        >
            <div
                style={{
                    minWidth: 500,
                    display: 'flex',
                    gap: 8,
                }}
            >
                <div
                    style={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                    }}
                >
                    <TextInput
                        label='Config path'
                        {...register('settingS_PATH', { disabled: true })}
                    />

                    <TextInput
                        label='DB path'
                        {...register('dB_PATH')}
                    />

                    <TextInput
                        label='Storage path'
                        {...register('storagE_PATH')}
                    />

                    <TextInput
                        label='Backups path'
                        {...register('backuP_PATH')}
                    />
                </div>

                <div
                    style={{
                        flexGrow: 1,
                    }}
                >
                    <TextInput
                        label='Saves globs'
                        area
                        style={{
                            minHeight: '100%'
                        }}
                        {...register('savE_GLOBS')}
                    />
                </div>
            </div>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 8,
                }}
            >
                <Button
                    onClick={() => reset(defaultValue)}
                    big
                >Cancel</Button>
                <Button
                    onClick={submit}
                    big
                    bgColor={theme.bg.primary}
                >Submit</Button>
            </div>
        </form>
    </TitledContainer>;
};
