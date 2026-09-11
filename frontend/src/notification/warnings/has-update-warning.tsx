import { ActionIcon, Table } from '@mantine/core';
import { ExternalLinkIcon } from 'lucide-react';
import type React from 'react';
import { useSettingsGet } from '../../data/sdk/settings/settings.gen';
import { useTranslate } from '../../translate/i18n';
import { useCheckUpdate } from '../hooks/use-check-update';

export const HasUpdateWarning: React.FC = () => {
    const { t } = useTranslate();

    const settingsQuery = useSettingsGet();
    const updateUrl = settingsQuery.data?.data.updateUrl;

    const updateVersion = useCheckUpdate();
    if (!updateVersion || !updateUrl) {
        return null;
    }

    return <Table.Tr>
        <Table.Td>
            {t('notifications.warnings.update', {
                variant: updateVersion
            })}
        </Table.Td>
        <Table.Td valign='top'>
            <ActionIcon
                color='blue'
                component='a'
                href={updateUrl}
                target='__blank'
            >
                <ExternalLinkIcon fontSize='1lh' />
            </ActionIcon>
        </Table.Td>
    </Table.Tr>;
};
