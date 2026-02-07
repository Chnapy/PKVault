import type React from 'react';
import { useBackupDelete, useBackupGetAll, useBackupRestore } from '../../data/sdk/backup/backup.gen';
import { useSettingsGet } from '../../data/sdk/settings/settings.gen';
import { withErrorCatcher } from '../../error/with-error-catcher';
import { useTranslate } from '../../translate/i18n';
import { ButtonWithConfirm } from '../../ui/button/button-with-confirm';
import { Container } from '../../ui/container/container';
import { TitledContainer } from '../../ui/container/titled-container';
import { Icon } from '../../ui/icon/icon';
import { theme } from '../../ui/theme';
import { useDesktopMessage } from '../save-globs/hooks/use-desktop-message';
import { css } from '@emotion/css';

export const Backup: React.FC = withErrorCatcher('default', () => {
    const { t } = useTranslate();

    const settings = useSettingsGet().data?.data;
    const backupQuery = useBackupGetAll();
    const backupDeleteMutation = useBackupDelete();
    const backupRestoreMutation = useBackupRestore();

    const desktopMessage = useDesktopMessage();

    if (!backupQuery.data) {
        return null;
    }

    const normTo2 = (value: number) => `${value < 10 ? "0" : ""}${value}`;
    const renderDate = (date: Date) => `${normTo2(date.getDate())}/${normTo2(date.getMonth() + 1)}/${normTo2(date.getFullYear() - 2000)}`;
    const renderTime = (date: Date) => `${normTo2(date.getHours())}:${normTo2(date.getMinutes())}:${normTo2(date.getSeconds())}`;

    const sortedBackups = [ ...backupQuery.data.data ]
        .sort((a, b) => a.createdAt < b.createdAt ? 1 : -1);

    const days = [ ...new Set(sortedBackups.map(backup => new Date(backup.createdAt)).map(renderDate)) ];

    const title = t('settings.backups.title', { count: backupQuery.data.data.length });

    return <TitledContainer title={desktopMessage
        ? <div
            role='button'
            onClick={() => settings && desktopMessage.openFile({
                type: 'open-folder',
                isDirectory: true,
                path: settings.settingsMutable.backuP_PATH
            })}
            className={css({
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
            })}
        >
            {title}

            <Icon name='folder' solid forButton />
        </div>
        : title}>

        <div className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            marginBottom: 4,
        })}>
            <Icon name='info-circle' solid forButton />
            {t('settings.backups.help')}
        </div>

        <div
            className={css({
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
                flexWrap: 'wrap'
            })}
        >

            {days.map(day => {
                const dayBackups = sortedBackups.filter(backup => renderDate(new Date(backup.createdAt)) === day);

                return <Container
                    key={day}
                    className={css({
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                        padding: 8,
                        maxHeight: 300,
                        overflowY: 'auto',
                    })}
                >
                    <div
                        className={css({
                            textAlign: 'center',
                            marginBottom: 8,
                        })}
                    >{day}</div>

                    {dayBackups.map(backup => <div key={backup.createdAt} className={css({
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                    })}>
                        <span
                            role='button'
                            onClick={desktopMessage
                                ? (() => desktopMessage.openFile({
                                    type: 'open-folder',
                                    isDirectory: true,
                                    path: backup.filepath,
                                }))
                                : undefined}
                            className={css({
                                flexGrow: 1,
                                marginRight: 16,
                                cursor: desktopMessage ? 'pointer' : undefined,
                            })}
                        >{renderTime(new Date(backup.createdAt))}</span>

                        <ButtonWithConfirm onClick={() => backupRestoreMutation.mutateAsync({
                            params: {
                                createdAt: backup.createdAt,
                            }
                        })} bgColor={theme.bg.primary}>
                            <Icon name='upload' forButton />
                        </ButtonWithConfirm>
                        {/* <Button<'a'> as='a' href={downloadUrl}> // TODO download backup
                                  <Icon name='download' forButton />
                                </Button> */}
                        <ButtonWithConfirm onClick={() => backupDeleteMutation.mutateAsync({
                            params: {
                                createdAt: backup.createdAt,
                            }
                        })} bgColor={theme.bg.red}>
                            <Icon name='trash' solid forButton />
                        </ButtonWithConfirm>
                    </div>)}
                </Container>;
            })}
        </div>
    </TitledContainer>
});
