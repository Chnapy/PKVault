import { Badge, Group, Table, Text } from '@mantine/core';
import type React from 'react';
import type { MoveCategory } from '../../../../../data/sdk/model';
import { UIAlphaIcon } from '../../../../icon/ui-alpha-icon';
import { UIMoveCategoryIcon } from '../../../../icon/ui-move-category-icon';
import { UIPokedexIcons } from '../../../../pokedex/icons/ui-pokedex-icons';
import { UITypeItem } from '../../../../type-item/ui-type-item';
import classes from './ui-details-move-row.module.css';

export type UIDetailsMoveRowProps = Pick<Table.Tr.Props, 'onClick'> & {
    type: number;
    name: string;
    nameWidth?: number | string;
    category: MoveCategory;
    power?: number;
    accuracy?: number;
    level?: number;
    isAlpha?: boolean;
    isValid?: boolean;
};

export const UIDetailsMoveRow: React.FC<UIDetailsMoveRowProps> = ({
    type, name, nameWidth, category, power, accuracy, level, onClick, isAlpha, isValid = true
}) => {

    return <Table.Tr className={classes.uiDetailsMoveRow} onClick={onClick} data-clickable={!!onClick || undefined}>
        {level !== undefined && <Table.Td ta='center'>
            {level}
        </Table.Td>}

        <Table.Td>
            <UITypeItem type={type} />
        </Table.Td>

        <Table.Td w={nameWidth}>
            <Group gap='xs' wrap='nowrap' miw={100}>
                {isAlpha && <UIAlphaIcon />}

                <Text
                    lh={1}
                    ta='center'
                    style={{ flexGrow: 1 }}
                >{name}</Text>

                {!isValid && <UIPokedexIcons.Warn />}
            </Group>
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
                        alignItems: 'center',
                        overflow: 'initial',
                    },
                }}
            >
                <UIMoveCategoryIcon category={category} />
            </Badge>
        </Table.Td>
        <Table.Td miw='2rem'>
            {power ?? '-'}
        </Table.Td>

        {level === undefined && <Table.Td miw='2rem'>
            {accuracy ? `${accuracy}%` : '-'}
        </Table.Td>}
    </Table.Tr>;
};
