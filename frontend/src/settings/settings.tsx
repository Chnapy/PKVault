import React from 'react';
import { useForm } from 'react-hook-form';
import type { SettingsMutableDTO } from '../data/sdk/model/settingsMutableDTO';
import { useSettingsEdit, useSettingsGet } from '../data/sdk/settings/settings.gen';
import { Button, ButtonLink } from '../ui/button/button';
import { TitledContainer } from '../ui/container/titled-container';
import { Icon } from '../ui/icon/icon';
import { SelectStringInput } from '../ui/input/select-input';
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

    const { register, watch, reset, setValue, handleSubmit } = useForm<Omit<SettingsMutableDTO, 'savE_GLOBS'> & { savE_GLOBS: string }>({
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
            onSubmit={submit}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
            }}
        >
            {!settings.canUpdateSettings && <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
            }}>
                <Icon name='info-circle' solid forButton />
                You cannot change settings with waiting storage actions
                <ButtonLink to='/storage'>Check storage</ButtonLink>
            </div>}
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
                    <SelectStringInput
                        label='Language'
                        data={[
                            { value: 'en', option: 'English', disabled: watch('language') === 'en' },
                            { value: 'fr', option: 'Français', disabled: watch('language') === 'fr' },
                        ]}
                        {...register('language')}
                        value={watch('language')}
                        onChange={value => setValue('language', value)}
                        disabled={!settings.canUpdateSettings}
                    />

                    <TextInput
                        label='Database path'
                        {...register('dB_PATH', { setValueAs: (value) => value.trim() })}
                        disabled={!settings.canUpdateSettings}
                    />

                    <TextInput
                        label='Backups path'
                        {...register('backuP_PATH', { setValueAs: (value) => value.trim() })}
                        disabled={!settings.canUpdateSettings}
                    />
                </div>

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
                        label='Storage path (PKM files)'
                        {...register('storagE_PATH', { setValueAs: (value) => value.trim() })}
                        disabled={!settings.canUpdateSettings}
                    />
                </div>
            </div>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <TextInput
                    label='Saves files & globs'
                    area
                    style={{
                        minHeight: 200,
                        height: '100%',
                    }}
                    {...register('savE_GLOBS')}
                    disabled={!settings.canUpdateSettings}
                />
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 4
                }}>
                    <Icon name='info-circle' solid forButton />
                    List all your saves files paths, you can also use globs.
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
                    disabled={!settings.canUpdateSettings}
                    big
                >Cancel</Button>
                <Button
                    type='submit'
                    disabled={!settings.canUpdateSettings}
                    big
                    bgColor={theme.bg.primary}
                >Submit</Button>
            </div>
        </form>
    </TitledContainer>;
};
