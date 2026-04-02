import { css } from '@emotion/css';
import type React from 'react';
import { useBackupGetAll } from '../../data/sdk/backup/backup.gen';
import { useSettingsGet } from '../../data/sdk/settings/settings.gen';
import { withErrorCatcher } from '../../error/with-error-catcher';
import { HelpButton } from '../../help/help-button';
import { useTranslate } from '../../translate/i18n';
import { Container } from '../../ui/container/container';
import { TitledContainer } from '../../ui/container/titled-container';
import { Icon } from '../../ui/icon/icon';
import { renderDate, renderTime } from '../../ui/util/render-date-time';
import { useDesktopMessage } from '../globs-input/hooks/use-desktop-message';
import { BackupLine } from './backup-line';

export const Backup: React.FC = withErrorCatcher('default', () => {
    const { t } = useTranslate();

    const settings = useSettingsGet().data?.data;
    const backupQuery = useBackupGetAll();

    const desktopMessage = useDesktopMessage();

    if (!backupQuery.data) {
        return null;
    }

    const sortedBackups = [ ...backupQuery.data.data ]
        .sort((a, b) => a.createdAt < b.createdAt ? 1 : -1)
        .map(backup => {
            const createdAtDate = new Date(backup.createdAt);

            return {
                backup,
                createdAtDateStr: renderDate(createdAtDate),
                createdAtTimeStr: renderTime(createdAtDate),
            };
        });

    const days = [ ...new Set(sortedBackups.map(backup => backup.createdAtDateStr)) ];

    const title = t('settings.backups.title', { count: backupQuery.data.data.length });

    return <TitledContainer title={
        <div
            className={css({
                display: 'flex',
                alignItems: 'center',
                gap: 4,
            })}
        >
            {desktopMessage
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
                : title}

            <HelpButton slug='5-settings.md#backups' />
        </div>}>

        <div className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            whiteSpace: 'break-spaces',
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
                const dayBackups = sortedBackups.filter(backup => backup.createdAtDateStr === day);

                return <Container
                    key={day}
                    className={css({
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        padding: 8,
                        maxHeight: 300,
                        overflowY: 'auto',
                    })}
                >
                    <div
                        className={css({
                            textAlign: 'center',
                        })}
                    >{day}</div>

                    <div
                        className={css({
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'stretch',
                            gap: 8,
                        })}
                    >
                        {dayBackups.map(({ backup }) => <BackupLine
                            key={backup.createdAt}
                            {...backup}
                        />)}
                    </div>
                </Container>;
            })}
        </div>
    </TitledContainer>
});
