import { Table } from '@mantine/core';
import type React from 'react';
import classes from './ui-details-content-stats.module.css';

export type UIDetailsContentStatsProps = {
    iv?: boolean;
    ev?: boolean;
    children: React.ReactNode;
};

export const UIDetailsContentStats: React.FC<UIDetailsContentStatsProps> = ({ iv, ev, children }) => {
    return <Table
        className={classes.uiDetailsContentStats}
        withRowBorders={false}
        verticalSpacing='sm'
        horizontalSpacing='sm'
    >
        <Table.Thead>
            <Table.Tr>
                <Table.Th></Table.Th>
                <Table.Th colSpan={2} ta='center'>Stat</Table.Th>
                {iv && <Table.Th ta='center'>IV</Table.Th>}
                {ev && <Table.Th ta='center'>EV</Table.Th>}
            </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
            {children}
        </Table.Tbody>
    </Table>;
};
