import { Badge, Progress, Table } from '@mantine/core';
import type React from 'react';

const statsInfos = {
    hp: {
        name: 'HP',
        color: '#4caf70',
    },
    atk: {
        name: 'Atk',
        color: '#f08030',
    },
    def: {
        name: 'Def',
        color: '#f0c030',
    },
    spa: {
        name: 'SpA',
        color: '#6890f0',
    },
    spd: {
        name: 'SpD',
        color: '#78c850',
    },
    spe: {
        name: 'Spe',
        color: '#f85888',
    },
};

export type UIDetailsStatsRowProps = {
    stat: keyof typeof statsInfos;
    value: number;
    iv: number;
    ev: number;
};

export const UIDetailsStatsRow: React.FC<UIDetailsStatsRowProps> = ({ stat, value, iv, ev }) => {
    const { name, color } = statsInfos[ stat ];

    const level = 50;
    const maxStats = 500;
    const minStats = 5;

    const maxStatsRatio = minStats + (maxStats - minStats) * (level / 100);
    const progressValue = value / maxStatsRatio * 100;

    return <Table.Tr>
        <Table.Th>{name}</Table.Th>
        <Table.Td>
            <Progress
                value={progressValue}
                color={color}
                style={{ alignSelf: 'stretch', justifySelf: 'stretch', flexGrow: 1 }}
            />
        </Table.Td>
        <Table.Td>
            {value}
        </Table.Td>
        <Table.Td>
            <Badge
                variant='outline'
                color={`rgb(${255 - (255 * iv / 31)},${255 * iv / 31},0)`}
                c='inherit'
                radius='sm'
                miw='100%'
                styles={{
                    label: {
                        minWidth: 'fit-content',
                    }
                }}
            >
                {iv}
            </Badge>
        </Table.Td>
        <Table.Td>
            <Badge
                variant='outline'
                color={`rgb(${255 - (255 * ev / 252)},${255 * ev / 252},0)`}
                c='inherit'
                radius='sm'
                miw='100%'
                styles={{
                    label: {
                        minWidth: 'fit-content',
                    }
                }}
            >
                {ev}
            </Badge>
        </Table.Td>
    </Table.Tr>;
};
