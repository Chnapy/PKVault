import React from 'react';
import { useForm } from 'react-hook-form';
import { HistoryContext } from '../context/history-context';
import type { SettingsMutableDTO } from '../data/sdk/model/settingsMutableDTO';
import { useSettingsEdit, useSettingsGet } from '../data/sdk/settings/settings.gen';
import { withErrorCatcher } from '../error/with-error-catcher';
import { useTranslate } from '../translate/i18n';
import { Button, ButtonLink } from '../ui/button/button';
import { TitledContainer } from '../ui/container/titled-container';
import { Icon } from '../ui/icon/icon';
import { SelectStringInput } from '../ui/input/select-input';
import { TextInput } from '../ui/input/text-input';
import { theme } from '../ui/theme';
import { useDesktopMessage } from './save-globs/hooks/use-desktop-message';
import { SaveGlobsList } from './save-globs/save-globs-list';
import { css } from '@emotion/css';

export const Settings: React.FC = withErrorCatcher('default', () => {
    const { t } = useTranslate();

    const storageHistoryValue = HistoryContext.useValue()[ '/storage' ];

    const desktopMessage = useDesktopMessage();

    const settingsQuery = useSettingsGet();
    const settingsMutation = useSettingsEdit();

    const settings = settingsQuery.data?.data;
    const settingsMutable = settings?.settingsMutable;

    const defaultValue = React.useMemo(() => settingsMutable && ({
        ...settingsMutable,
        savE_GLOBS: settingsMutable.savE_GLOBS.join('\n'),
    }), [ settingsMutable ]);

    const { register, watch, reset, setValue, getValues, handleSubmit, formState } = useForm<Omit<SettingsMutableDTO, 'savE_GLOBS'> & { savE_GLOBS: string }>({
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

    return <TitledContainer title={<div className={css({ display: 'flex', justifyContent: 'space-between' })}>
        {t('settings.title')}

        <div className={css({ marginLeft: 'auto' })}>
            v{settings?.version} - Build ID = {settings?.buildID} - PKHeX {settings?.pkhexVersion}
        </div>
    </div>}>
        <form
            onSubmit={submit}
            className={css({
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
            })}
        >
            <div
                className={css({
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap'
                })}
            >
                <div
                    className={css({
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                    })}
                >
                    <SelectStringInput
                        label={t('settings.form.language')}
                        data={[
                            { value: 'en', option: 'English', disabled: watch('language') === 'en' },
                            { value: 'fr', option: 'Français', disabled: watch('language') === 'fr' },
                        ]}
                        {...register('language')}
                        value={watch('language')}
                        onChange={value => setValue('language', value)}
                        disabled={!settings.canUpdateSettings}
                    />
                </div>

                <div
                    className={css({
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                    })}
                >
                    <TextInput
                        label={desktopMessage
                            ? <>
                                <div>{t('settings.form.config')}</div>
                                <div
                                    role='button'
                                    onClick={() => desktopMessage.openFile({
                                        type: 'open-folder',
                                        isDirectory: false,
                                        path: settings.settingsPath,
                                    })}>
                                    <Icon name='folder' solid forButton />
                                </div>
                            </>
                            : t('settings.form.config')
                        }
                        value={settings.settingsPath}
                        disabled
                    />
                </div>
            </div>

            <SaveGlobsList
                {...register('savE_GLOBS')}
                value={watch('savE_GLOBS')}
                onChange={(value) => setValue('savE_GLOBS', value)}
                disabled={!settings.canUpdateSettings}
            />

            <details>
                <summary className={css({ cursor: 'pointer' })}>{t('settings.advanced')}</summary>

                <div className={css({
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                })}>
                    <div className={css({
                        display: 'flex',
                        justifyContent: 'center',
                        gap: 4
                    })}>
                        <Icon name='info-circle' solid forButton />
                        {t('settings.relative-paths')}: {settings.appDirectory}
                    </div>

                    <div
                        className={css({
                            display: 'flex',
                            gap: 8,
                            flexWrap: 'wrap'
                        })}
                    >
                        <div
                            className={css({
                                flexGrow: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8,
                            })}
                        >
                            <TextInput
                                label={desktopMessage
                                    ? <>
                                        <div>{t('settings.form.db')}</div>
                                        <div
                                            role='button'
                                            onClick={() => desktopMessage.openFile({
                                                type: 'open-folder',
                                                isDirectory: false,
                                                path: getValues('dB_PATH'),
                                            })}>
                                            <Icon name='folder' solid forButton />
                                        </div>
                                    </>
                                    : t('settings.form.db')
                                }
                                {...register('dB_PATH', { setValueAs: (value) => value.trim() })}
                                disabled={!settings.canUpdateSettings}
                            />

                            <TextInput
                                label={desktopMessage
                                    ? <>
                                        <div>{t('settings.form.backups')}</div>
                                        <div
                                            role='button'
                                            onClick={() => desktopMessage.openFile({
                                                type: 'open-folder',
                                                isDirectory: false,
                                                path: getValues('backuP_PATH'),
                                            })}>
                                            <Icon name='folder' solid forButton />
                                        </div>
                                    </>
                                    : t('settings.form.backups')
                                }
                                {...register('backuP_PATH', { setValueAs: (value) => value.trim() })}
                                disabled={!settings.canUpdateSettings}
                            />
                        </div>

                        <div
                            className={css({
                                flexGrow: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8,
                            })}
                        >
                            <TextInput
                                label={desktopMessage
                                    ? <>
                                        <div>{t('settings.form.storage')}</div>
                                        <div
                                            role='button'
                                            onClick={() => desktopMessage.openFile({
                                                type: 'open-folder',
                                                isDirectory: false,
                                                path: getValues('storagE_PATH'),
                                            })}>
                                            <Icon name='folder' solid forButton />
                                        </div>
                                    </>
                                    : t('settings.form.storage')
                                }
                                {...register('storagE_PATH', { setValueAs: (value) => value.trim() })}
                                disabled={!settings.canUpdateSettings}
                            />
                        </div>
                    </div>
                </div>
            </details>

            <div
                className={css({
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 8,
                })}
            >
                <Button
                    onClick={() => reset(defaultValue)}
                    disabled={!settings.canUpdateSettings}
                    big
                >{t('action.cancel')}</Button>
                <Button
                    type='submit'
                    loading={formState.isSubmitting}
                    disabled={!settings.canUpdateSettings}
                    big
                    bgColor={theme.bg.primary}
                >{t('action.submit')}</Button>
            </div>

            {!settings.canUpdateSettings && <div className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
            })}>
                <Icon name='info-circle' solid forButton />
                {t('action.not-possible')}
                <ButtonLink to='/storage' {...storageHistoryValue}>{t('action.check-storage')}</ButtonLink>
            </div>}
        </form>
    </TitledContainer>;
});
