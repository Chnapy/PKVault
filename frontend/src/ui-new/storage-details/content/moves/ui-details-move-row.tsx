import { Badge, Table, Text } from '@mantine/core';
import type React from 'react';
import type { MoveCategory } from '../../../../data/sdk/model';
import { UIMoveCategoryIcon } from '../../../icon/ui-move-category-icon';
import { UITypeItem } from '../../../type-item/ui-type-item';
import classes from './ui-details-move-row.module.css';

export type UIDetailsMoveRowProps = {
    type: number;
    name: string;
    category: MoveCategory;
    power?: number;
    accuracy?: number;
};

export const UIDetailsMoveRow: React.FC<UIDetailsMoveRowProps> = ({
    type, name, category, power, accuracy
}) => {

    return <Table.Tr className={classes.uiDetailsMoveRow}>
        <Table.Td>
            <UITypeItem type={type} />
        </Table.Td>

        <Table.Td>
            <Text>{name}</Text>
        </Table.Td>

        <Table.Td>
            <Badge
                // variant='default'
                color='dark.4'
                radius='xs'
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
        <Table.Td>
            {power ?? '-'}
        </Table.Td>

        <Table.Td>
            {accuracy ? `${accuracy}%` : '-'}
        </Table.Td>
    </Table.Tr>;
};
