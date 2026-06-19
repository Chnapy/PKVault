import { ActionIcon, Table } from '@mantine/core';
import { ExternalLinkIcon } from 'lucide-react';
import type React from 'react';
import { useTranslate } from '../../translate/i18n';
import { useCheckUpdate } from '../hooks/use-check-update';

export const HasUpdateWarning: React.FC = () => {
    const { t } = useTranslate();

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
            <ActionIcon
                color='blue'
                component='a'
                href='https://projectpokemon.org/home/files/file/5766-pkvault/'
                target='__blank'
            >
                <ExternalLinkIcon fontSize='1lh' />
            </ActionIcon>
        </Table.Td>
    </Table.Tr>;
};
