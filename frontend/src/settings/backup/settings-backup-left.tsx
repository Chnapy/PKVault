import { Card, SimpleGrid, Tooltip } from '@mantine/core';
import { DatabaseZapIcon, FileArchiveIcon, FolderArchiveIcon, FolderTreeIcon, RefreshCcwIcon } from 'lucide-react';
import type React from "react";
import { useBackupCreate } from '../../data/sdk/backup/backup.gen';
import { useSettingsGet } from '../../data/sdk/settings/settings.gen';
import { useTranslate } from '../../translate/i18n';
import { UIButton } from '../../ui/form/button/ui-button';
import { UIInputLabel } from '../../ui/form/ui-input-label';
import { UIPathLine } from '../../ui/path/ui-path-line';

export const SettingsBackupLeft: React.FC = () => {
    const { t } = useTranslate();

    const settingsQuery = useSettingsGet();
    const backupCreateMutation = useBackupCreate();

    const settings = settingsQuery.data?.data;

    return <>
        <Card>
            <SimpleGrid cols={2}>
                <UIInputLabel leftSection={<FolderArchiveIcon />} label={t('settings.backups.1.label')} />
                <UIPathLine>{settings?.settingsMutable.backuP_PATH ?? '-'}</UIPathLine>

                <UIInputLabel leftSection={<FolderTreeIcon />} label={t('settings.backups.2.label')} />
                <div>{t('settings.backups.2.description')}</div>

                <UIInputLabel leftSection={<RefreshCcwIcon />} label={t('settings.backups.3.label')} />
                <div>{t('settings.backups.3.description')}</div>

                <UIInputLabel leftSection={<FileArchiveIcon />} label={t('settings.backups.4.label')} />
                <div>{t('settings.backups.4.description')}</div>
            </SimpleGrid>
        </Card>

        <Card>
            <Tooltip
                label={t('action.not-possible')}
                disabled={settings?.canCreateBackup}
            >
                <UIButton
                    name='create-backup'
                    controlLabel={t('action.select')}
                    onClick={() => backupCreateMutation.mutateAsync()}
                    disabled={!settings?.canCreateBackup}
                    leftSection={<DatabaseZapIcon />}
                >
                    {t('settings.backups.create')}
                </UIButton>
            </Tooltip>
        </Card>
    </>;
};
