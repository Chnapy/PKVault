import { Table } from '@mantine/core';
import type React from 'react';
import classes from './ui-details-move-row.module.css';

export type UIDetailsContentMoveTableProps = {
    header?: React.ReactNode;
    children: React.ReactNode;
};

export const UIDetailsContentMoveTable: React.FC<UIDetailsContentMoveTableProps> = ({ header, children }) => {

    return <Table
        className={classes.uiDetailsContentMove}
        withRowBorders={false}
        verticalSpacing='sm'
        horizontalSpacing='sm'
    >
        {header && <Table.Thead>
            <Table.Tr>
                {header}
            </Table.Tr>
        </Table.Thead>}
        <Table.Tbody>
            {children}
        </Table.Tbody>
    </Table>;
};
