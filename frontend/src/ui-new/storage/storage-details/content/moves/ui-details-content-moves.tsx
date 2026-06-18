import { Table } from '@mantine/core';
import type React from 'react';
import { UIDetailsContentMoveTable } from './ui-details-content-moves-table';

export type UIDetailsContentMoveProps = {
    moves: React.ReactNode;
    relearnMoves?: React.ReactNode;
};

export const UIDetailsContentMove: React.FC<UIDetailsContentMoveProps> = ({ moves, relearnMoves }) => {

    return <>
        <UIDetailsContentMoveTable
            header={<>
                <Table.Th colSpan={3} ta='center'>Move</Table.Th>
                <Table.Th ta='center'>Pow.</Table.Th>
                <Table.Th ta='center'>Acc.</Table.Th>
            </>}
        >
            {moves}
        </UIDetailsContentMoveTable>

        {relearnMoves && <UIDetailsContentMoveTable
            header={<>
                <Table.Th colSpan={3} ta='center'>Relearn Move</Table.Th>
                <Table.Th ta='center'>Pow.</Table.Th>
                <Table.Th ta='center'>Acc.</Table.Th>
            </>}
        >
            {relearnMoves}
        </UIDetailsContentMoveTable>}
    </>;
};
