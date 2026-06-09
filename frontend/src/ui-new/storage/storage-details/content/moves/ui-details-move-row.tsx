import { Badge, Table, Text } from '@mantine/core';
import type React from 'react';
import type { MoveCategory } from '../../../../../data/sdk/model';
import { UIMoveCategoryIcon } from '../../../../icon/ui-move-category-icon';
import { UITypeItem } from '../../../../type-item/ui-type-item';
import classes from './ui-details-move-row.module.css';

export type UIDetailsMoveRowProps = Pick<Table.Tr.Props, 'onClick'> & {
    type: number;
    name: string;
    nameWidth?: number | string;
    category: MoveCategory;
    power?: number;
    accuracy?: number;
};

export const UIDetailsMoveRow: React.FC<UIDetailsMoveRowProps> = ({
    type, name, nameWidth, category, power, accuracy, onClick
}) => {

    return <Table.Tr className={classes.uiDetailsMoveRow} onClick={onClick} data-clickable={!!onClick || undefined}>
        <Table.Td>
            <UITypeItem type={type} />
        </Table.Td>

        <Table.Td w={nameWidth}>
            <Text lh={1}>{name}</Text>
        </Table.Td>

        <Table.Td>
            <Badge
                // variant='default'
                color='dark.4'
                radius='sm'
                px={'xs'}
                styles={{
                    label: {
                        display: 'flex',
                        alignItems: 'center'
                    },
                }}
            >
                <UIMoveCategoryIcon category={category} />
            </Badge>
        </Table.Td>
        <Table.Td miw='2rem'>
            {power ?? '-'}
        </Table.Td>

        <Table.Td miw='2rem'>
            {accuracy ? `${accuracy}%` : '-'}
        </Table.Td>
    </Table.Tr>;
};
