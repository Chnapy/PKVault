import { Table } from '@mantine/core';
import type React from 'react';
import classes from './ui-details-move-row.module.css';

export type UIDetailsContentMoveProps = {
    children: React.ReactNode;
};

export const UIDetailsContentMove: React.FC<UIDetailsContentMoveProps> = ({ children }) => {

    return <Table
        className={classes.uiDetailsContentMove}
        withRowBorders={false}
        verticalSpacing='sm'
        horizontalSpacing='sm'
    >
        <Table.Thead>
            <Table.Tr>
                <Table.Th colSpan={3} ta='center'>Move</Table.Th>
                <Table.Th ta='center'>Pow.</Table.Th>
                <Table.Th ta='center'>Acc.</Table.Th>
            </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
            {children}
        </Table.Tbody>
    </Table>;
};
