import { Loader, Table, Text, Title } from '@mantine/core';
import type React from 'react';
import { useDexGetMoves } from '../../../data/sdk/dex/dex.gen';
import type { EntityContext } from '../../../data/sdk/model';
import { MoveItem } from '../../../storage/details/move-item/move-item';
import { useTranslate } from '../../../translate/i18n';
import { UIDetailsContentMoveTable } from '../../../ui/storage/storage-details/content/moves/ui-details-content-moves-table';

type PokedexDetailsMovesProps = {
    context: EntityContext;
    generation: number;
    species: number;
    formIndex: number;
};

export const PokedexDetailsMoves: React.FC<PokedexDetailsMovesProps> = ({ context, generation, species, formIndex }) => {
    const { t } = useTranslate();

    const dexMoves = useDexGetMoves({ context, species, form: formIndex });

    if (dexMoves.isPending)
        return <Loader />;

    if (!dexMoves.data)
        return null;

    const { learnMoves, eggMoves, inheritMoves, tmhmMoves, tutorMoves } = dexMoves.data.data;
    const learnableMoves = Object.entries(learnMoves).sort((m1, m2) => m1[ 1 ] - m2[ 1 ]);

    return <>
        <Title order={5} ta='center'>{t('details.moves.learnable')}</Title>
        {learnableMoves.length > 0
            ? <UIDetailsContentMoveTable
                header={<>
                    <Table.Th ta='center'>{t('details.level')}</Table.Th>
                    <Table.Th colSpan={3} ta='center'>{t('details.moves.move')}</Table.Th>
                    <Table.Th ta='center'>{t('details.moves.power')}</Table.Th>
                </>}
            >
                {learnableMoves.map(([ move, level ]) => <MoveItem
                    key={move}
                    move={+move}
                    saveId={null}
                    generation={generation}
                    level={level}
                />)}
            </UIDetailsContentMoveTable>
            : <Text ta='center'>-</Text>}

        <Title order={5} ta='center' mt='md'>{t('details.moves.tmhm')}</Title>
        {tmhmMoves.length > 0
            ? <UIDetailsContentMoveTable
                header={<>
                    <Table.Th colSpan={3} ta='center'>{t('details.moves.move')}</Table.Th>
                    <Table.Th ta='center'>{t('details.moves.power')}</Table.Th>
                    <Table.Th ta='center'>{t('details.moves.accuracy')}</Table.Th>
                </>}
            >
                {tmhmMoves.map(move => <MoveItem
                    key={move}
                    move={+move}
                    saveId={null}
                    generation={generation}
                />)}
            </UIDetailsContentMoveTable>
            : <Text ta='center'>-</Text>}

        <Title order={5} ta='center' mt='md'>{t('details.moves.tutoring')}</Title>
        {tutorMoves.length > 0
            ? <UIDetailsContentMoveTable
                header={<>
                    <Table.Th colSpan={3} ta='center'>{t('details.moves.move')}</Table.Th>
                    <Table.Th ta='center'>{t('details.moves.power')}</Table.Th>
                    <Table.Th ta='center'>{t('details.moves.accuracy')}</Table.Th>
                </>}
            >
                {tutorMoves.map(move => <MoveItem
                    key={move}
                    move={+move}
                    saveId={null}
                    generation={generation}
                />)}
            </UIDetailsContentMoveTable>
            : <Text ta='center'>-</Text>}

        <Title order={5} ta='center' mt='md'>{t('details.moves.breeding')}</Title>
        {eggMoves.length > 0
            ? <UIDetailsContentMoveTable
                header={<>
                    <Table.Th colSpan={3} ta='center'>{t('details.moves.move')}</Table.Th>
                    <Table.Th ta='center'>{t('details.moves.power')}</Table.Th>
                    <Table.Th ta='center'>{t('details.moves.accuracy')}</Table.Th>
                </>}
            >
                {eggMoves.map(move => <MoveItem
                    key={move}
                    move={+move}
                    saveId={null}
                    generation={generation}
                />)}
            </UIDetailsContentMoveTable>
            : <Text ta='center'>-</Text>}

        <Title order={5} ta='center' mt='md'>{t('details.moves.prior-evo')}</Title>
        {inheritMoves.length > 0
            ? <UIDetailsContentMoveTable
                header={<>
                    <Table.Th colSpan={3} ta='center'>{t('details.moves.move')}</Table.Th>
                    <Table.Th ta='center'>{t('details.moves.power')}</Table.Th>
                    <Table.Th ta='center'>{t('details.moves.accuracy')}</Table.Th>
                </>}
            >
                {inheritMoves.map(move => <MoveItem
                    key={move}
                    move={+move}
                    saveId={null}
                    generation={generation}
                />)}
            </UIDetailsContentMoveTable>
            : <Text ta='center'>-</Text>}
    </>;
};
