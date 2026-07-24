import { Group, Stack, Table } from '@mantine/core';
import React from 'react';
import classes from './ui-details-content-cosmetic.module.css';

export type UIDetailsContentCosmeticProps = {
    contest: React.ReactNode;
    ribbons: React.ReactNode;
};

export const UIDetailsContentCosmetic: React.FC<UIDetailsContentCosmeticProps> = ({
    contest, ribbons,
}) => {
    return <Stack>
        <Table
            className={classes.uiDetailsContentCosmetic}
            withRowBorders={false}
            verticalSpacing='sm'
            horizontalSpacing='sm'
        >
            <Table.Thead>
                <Table.Tr>
                    <Table.Th colSpan={3} ta='center'>Contest</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {contest}
            </Table.Tbody>
        </Table>

        <Group>
            {ribbons}
        </Group>
    </Stack>;
};
