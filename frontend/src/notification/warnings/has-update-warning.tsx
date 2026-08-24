import { ActionIcon, Table } from '@mantine/core';
import { ExternalLinkIcon } from 'lucide-react';
import type React from 'react';
import { RuntimeSystem, SourceProvider } from '../../data/sdk/model';
import { useSettingsGet } from '../../data/sdk/settings/settings.gen';
import { useTranslate } from '../../translate/i18n';
import { useCheckUpdate } from '../hooks/use-check-update';

export const HasUpdateWarning: React.FC = () => {
    const { t } = useTranslate();

    const settingsQuery = useSettingsGet();

    const updateVersion = useCheckUpdate();
    if (!updateVersion) {
        return null;
    }

    return <Table.Tr>
        <Table.Td>
            {t('notifications.warnings.update', {
                variant: updateVersion
            })}
        </Table.Td>
        <Table.Td valign='top'>
            {settingsQuery.data?.data.sourceProvider === SourceProvider.GithubRelease && <ActionIcon
                color='blue'
                component='a'
                href={settingsQuery.data.data.runtimeSystem === RuntimeSystem.WINDOWS
                    ? 'https://projectpokemon.org/home/files/file/5766-pkvault/'
                    : 'https://github.com/Chnapy/PKVault/releases/latest'}
                target='__blank'
            >
                <ExternalLinkIcon fontSize='1lh' />
            </ActionIcon>}
        </Table.Td>
    </Table.Tr>;
};
