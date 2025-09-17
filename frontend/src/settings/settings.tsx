import React from 'react';
import { useForm } from 'react-hook-form';
import type { SettingsMutableDTO } from '../data/sdk/model/settingsMutableDTO';
import { useSettingsEdit, useSettingsGet } from '../data/sdk/settings/settings.gen';
import { Button } from '../ui/button/button';
import { TitledContainer } from '../ui/container/titled-container';
import { TextInput } from '../ui/input/text-input';
import { theme } from '../ui/theme';

export const Settings: React.FC = () => {
    const settingsQuery = useSettingsGet();
    const settingsMutation = useSettingsEdit();

    const settings = settingsQuery.data?.data;
    const settingsMutable = settings?.settingsMutable;

    const defaultValue = React.useMemo(() => settingsMutable && ({
        ...settingsMutable,
        savE_GLOBS: settingsMutable.savE_GLOBS.join('\n'),
    }), [ settingsMutable ]);

    const { register, reset, handleSubmit } = useForm<Omit<SettingsMutableDTO, 'savE_GLOBS'> & { savE_GLOBS: string }>({
        defaultValues: defaultValue
    });

    if (!settingsMutable) {
        return null;
    }

    const submit = handleSubmit(async (data) => {
        await settingsMutation.mutateAsync({
            data: {
                ...data,
                savE_GLOBS: data.savE_GLOBS.split('\n').map(value => value.trim()).filter(Boolean)
            },
        });
    });

    return <TitledContainer title={`Settings`}>
        <form
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap'
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
                        value={settings.settingsPath}
                        disabled
                    />

                    <TextInput
                        label='DB path'
                        {...register('dB_PATH', { setValueAs: (value) => value.trim() })}
                    />

                    <TextInput
                        label='Storage path'
                        {...register('storagE_PATH', { setValueAs: (value) => value.trim() })}
                    />

                    <TextInput
                        label='Backups path'
                        {...register('backuP_PATH', { setValueAs: (value) => value.trim() })}
                    />
                </div>

                <div
                    style={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <TextInput
                        label='Saves globs'
                        area
                        style={{
                            minHeight: 200,
                            height: '100%',
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
                    disabled={!settings.canUpdateSettings}
                    big
                    bgColor={theme.bg.primary}
                >Submit</Button>
            </div>
        </form>
    </TitledContainer>;
};
