import { Table } from '@mantine/core';
import type React from 'react';
import { UIDetailsContentMoveTable } from './ui-details-content-moves-table';
import { useTranslate } from '../../../../../translate/i18n';

export type UIDetailsContentMoveProps = {
    moves: React.ReactNode;
    relearnMoves?: React.ReactNode;
};

export const UIDetailsContentMove: React.FC<UIDetailsContentMoveProps> = ({ moves, relearnMoves }) => {
    const { t } = useTranslate();

    return <>
        <UIDetailsContentMoveTable
            header={<>
                <Table.Th colSpan={3} ta='center'>{t('details.moves.move')}</Table.Th>
                <Table.Th ta='center'>{t('details.moves.power')}</Table.Th>
                <Table.Th ta='center'>{t('details.moves.accuracy')}</Table.Th>
            </>}
        >
            {moves}
        </UIDetailsContentMoveTable>

        {relearnMoves && <UIDetailsContentMoveTable
            header={<>
                <Table.Th colSpan={3} ta='center'>{t('details.moves.relearn-move')}</Table.Th>
                <Table.Th ta='center'>{t('details.moves.power')}</Table.Th>
                <Table.Th ta='center'>{t('details.moves.accuracy')}</Table.Th>
            </>}
        >
            {relearnMoves}
        </UIDetailsContentMoveTable>}
    </>;
};
