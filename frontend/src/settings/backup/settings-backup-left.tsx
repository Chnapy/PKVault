import { Card, SimpleGrid } from '@mantine/core';
import { FileArchiveIcon, FolderArchiveIcon, FolderTreeIcon, RefreshCcwIcon } from 'lucide-react';
import type React from "react";
import { useSettingsGet } from '../../data/sdk/settings/settings.gen';
import { UIInputLabel } from '../../ui-new/form/ui-input-label';
import { UIPathLine } from '../../ui-new/path/ui-path-line';

export const SettingsBackupLeft: React.FC = () => {
    // const { t } = useTranslate();

    const settingsQuery = useSettingsGet();
    // const settingsMutation = useSettingsEdit();

    const settings = settingsQuery.data?.data;
    // const settingsMutable = settings?.settingsMutable;

    // const form = useFormContext<SettingsFormData>();

    return <>
        <Card>
            <SimpleGrid cols={2}>
                <UIInputLabel leftSection={<FolderArchiveIcon />} label='Backups directory' />
                <UIPathLine>{settings?.settingsMutable.backuP_PATH ?? '-'}</UIPathLine>

                <UIInputLabel leftSection={<FolderTreeIcon />} label='Backup content' />
                <div>All saves + all storage</div>

                <UIInputLabel leftSection={<RefreshCcwIcon />} label='Auto-backup' />
                <div>Before any file write (save)</div>

                <UIInputLabel leftSection={<FileArchiveIcon />} label='Generic format' />
                <div>Can be opened from outside PKVault (.zip)</div>
            </SimpleGrid>
        </Card>
    </>;
};
