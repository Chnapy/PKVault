import { Table } from '@mantine/core';
import type React from 'react';
import classes from './ui-details-content-stats.module.css';
import { useTranslate } from '../../../../../translate/i18n';

export type UIDetailsContentStatsProps = {
    iv?: boolean;
    ev?: boolean;
    asDv?: boolean;
    children: React.ReactNode;
};

export const UIDetailsContentStats: React.FC<UIDetailsContentStatsProps> = ({ iv, ev, asDv, children }) => {
    const { t } = useTranslate();

    return <Table
        className={classes.uiDetailsContentStats}
        withRowBorders={false}
        verticalSpacing='sm'
        horizontalSpacing='sm'
    >
        <Table.Thead>
            <Table.Tr>
                <Table.Th></Table.Th>
                <Table.Th colSpan={2} ta='center'>{t('details.stats.stat')}</Table.Th>
                {iv && <Table.Th ta='center'>
                    {asDv ? t('details.stats.ivs.dv') : t('details.stats.ivs.iv')}
                </Table.Th>}
                {ev && <Table.Th ta='center'>{t('details.stats.evs.ev')}</Table.Th>}
            </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
            {children}
        </Table.Tbody>
    </Table>;
};
