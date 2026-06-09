import { Table } from '@mantine/core';
import type React from 'react';
import { UIDetailsContentMoveTable } from './ui-details-content-moves-table';

export type UIDetailsContentMoveProps = {
    children: React.ReactNode;
};

export const UIDetailsContentMove: React.FC<UIDetailsContentMoveProps> = ({ children }) => {

    return <UIDetailsContentMoveTable
        header={<>
            <Table.Th colSpan={3} ta='center'>Move</Table.Th>
            <Table.Th ta='center'>Pow.</Table.Th>
            <Table.Th ta='center'>Acc.</Table.Th>
        </>}
    >
        {children}
    </UIDetailsContentMoveTable>;
};
