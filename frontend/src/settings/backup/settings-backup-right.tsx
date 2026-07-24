import { Tabs } from '@mantine/core';
import React from "react";
import { useBackupDelete, useBackupGetAll, useBackupRestore } from '../../data/sdk/backup/backup.gen';
import { UIBackupItem } from '../../ui/settings/backups/ui-backup-item';
import { UIBackupList } from '../../ui/settings/backups/ui-backup-list';
import { UIBackupsTabList } from '../../ui/settings/backups/ui-backups-tab-list';
import { renderDate, renderTime } from '../../util/render-date-time';
import { BackupLineForm } from './backup-line-form';

export const SettingsBackupRight: React.FC = () => {
    // const { t } = useTranslate();

    // const settings = useSettingsGet().data?.data;
    const backupQuery = useBackupGetAll();

    const backupRestoreMutation = useBackupRestore();
    const backupDeleteMutation = useBackupDelete();

    // const desktopMessage = useDesktopMessage();

    const sortedBackups = [ ...backupQuery.data?.data ?? [] ]
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

    const [ selectedDay, setSelectedDay ] = React.useState(days[ 0 ]);

    return <UIBackupList
        header={<UIBackupsTabList
            value={selectedDay ?? ''}
            onSelect={setSelectedDay}
            scopeId='settings-content'
        >
            {days.map(day => <Tabs.Tab key={day} value={day} p='md'>
                {day}
            </Tabs.Tab>)}
        </UIBackupsTabList>}
    >
        {sortedBackups
            .filter(bkp => bkp.createdAtDateStr === selectedDay)
            .map(({ backup }, i) => <UIBackupItem
                key={backup.filepath}
                order={i}
                createdAt={backup.createdAt}
                filename={backup.filepath.split('/').pop() ?? ''}
                path={backup.filepath}
                onRestore={() => backupRestoreMutation.mutateAsync({ params: { createdAt: backup.createdAt } })}
                onDelete={() => backupDeleteMutation.mutateAsync({ params: { createdAt: backup.createdAt } })}
            >
                <BackupLineForm
                    createdAt={backup.createdAt}
                    name={backup.name}
                />
            </UIBackupItem>)}
    </UIBackupList>;
};
